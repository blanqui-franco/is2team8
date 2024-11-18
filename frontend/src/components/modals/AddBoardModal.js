import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import BoardBackground from "./BoardBackground";
import { getEditControlsSidePosition } from "../boards/Card";
import {
    modalBlurHandler,
    getBoardBackgroundOptions,
    authAxios,
    getAddBoardStyle,
} from "../../static/js/util";
import useAxiosGet from "../../hooks/useAxiosGet";
import { backendUrl } from "../../static/js/const";

const getBackgroundModalPosition = (boardElem) => {
    // Calcula la posición del modal de fondo
    if (!boardElem) return null;
    return {
        top: boardElem.getBoundingClientRect().y + "px",
        left:
            boardElem.getBoundingClientRect().x +
            boardElem.getBoundingClientRect().width -
            200 +
            "px",
    };
};

const AddBoardModal = ({ setShowAddBoardModal, addBoard, project }) => {
    const [selectedBackground, setSelectedBackground] = useState(0);
    const [extraBackground, setExtraBackground] = useState(null); // Fondo personalizado seleccionado
    const [title, setTitle] = useState("");
    const [showBoardModal, setShowBoardModal] = useState(false);
    const boardElem = useRef(null);
    
    useEffect(modalBlurHandler(setShowAddBoardModal), []);

    const onSubmit = async (e) => {
        e.preventDefault();

        // Validación para el título
        if (!title.trim()) {
            alert("Por favor coloca un nombre para el tablero");
            return;
        }

        const bg = options[selectedBackground];
        const formData = { title };
        
        // Asignar el proyecto si está disponible
        if (project !== 0) formData.project = project;
        
        // Asignar fondo de color o imagen
        if (bg[1]) {
            formData.image_url = bg[2];
        } else {
            formData.color = bg[0].substring(1); // Remover "#" del color
        }

        try {
            const { data } = await authAxios.post(`${backendUrl}/boards/`, formData);
            addBoard(data); // Añadir el nuevo tablero al estado
            setShowAddBoardModal(false); // Cerrar el modal
        } catch (error) {
            console.error("Error al crear el tablero:", error.response?.data || error.message);
            alert(`Error al crear el tablero: ${error.response?.data?.detail || "Error desconocido"}`);
        }
    };

    const accessKey = process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY;
    const { data } = useAxiosGet(
        `https://api.unsplash.com/photos?client_id=${accessKey}`,
        false
    );
    const options = useMemo(() => getBoardBackgroundOptions(data), [data]); // Evitar reorganización de opciones en cada render
    if (extraBackground) options[0] = extraBackground;

    useEffect(() => {
        if (selectedBackground !== 0) setExtraBackground(null);
    }, [selectedBackground]);

    if (!data) return null;
    return (
        <>
            {showBoardModal ? (
                <BoardBackground
                    setShowBoardModal={setShowBoardModal}
                    extraBackground={extraBackground}
                    setExtraBackground={setExtraBackground}
                    setSelectedBackground={setSelectedBackground}
                    position={getBackgroundModalPosition(boardElem.current)}
                />
            ) : null}
            <div className="addboard-modal" role="dialog" aria-modal="true">
                <form className="addboard-modal__left" onSubmit={onSubmit}>
                    <div
                        className="addboard-modal__title-block"
                        style={getAddBoardStyle(...options[selectedBackground])}
                    >
                        <input
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                            className="addboard-modal__title"
                            placeholder="Agrega un titulo para el tablero"
                            aria-label="Titulo del tablero"
                            required
                        />
                        <button
                            type="button"
                            className="addboard-modal__exit"
                            onClick={() => setShowAddBoardModal(false)}
                            aria-label="Close modal"
                        >
                            <i className="fal fa-times"></i>
                        </button>
                    </div>
                    {title.trim() === "" ? (
                        <button
                            className="addboard-modal__create btn btn--disabled"
                            disabled
                            aria-disabled="true"
                        >
                            Crear Tablero
                        </button>
                    ) : (
                        <button
                            className="addboard-modal__create btn"
                            type="submit"
                        >
                            Crear Tablero
                        </button>
                    )}
                </form>

                <div className="addboard-modal__right" ref={boardElem}>
                    {options.map((option, index) => (
                        <button
                            key={uuidv4()}
                            onClick={() => setSelectedBackground(index)}
                            className={`addboard-modal__color-box${
                                option[1] ? " color-box--img" : ""
                            }`}
                            style={getAddBoardStyle(...option)}
                            aria-pressed={selectedBackground === index}
                        >
                            {selectedBackground === index && (
                                <i className="fal fa-check"></i>
                            )}
                        </button>
                    ))}
                    <button
                        className="addboard-modal__color-box"
                        onClick={() => setShowBoardModal(true)}
                        aria-label="More background options"
                    >
                        <i className="fal fa-ellipsis-h"></i>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddBoardModal;
