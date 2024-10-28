import React, { useState, useRef, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCard from "./DraggableCard";
import useBlurSetState from "../../hooks/useBlurSetState";
import { mergeRefs } from "../../static/js/util";
import { authAxios } from "../../static/js/util";
import { backendUrl } from "../../static/js/const";
import { updateList, addCard } from "../../static/js/board";
import globalContext from "../../context/globalContext";

// Función para obtener el estilo de la lista
const getListStyle = (isDragging, defaultStyle, isOverWIP) => {
    return {
        ...defaultStyle,
        backgroundColor: isOverWIP ? "#ffcccc" : defaultStyle.backgroundColor, // Cambiar color si se excede el WIP
        transform: isDragging ? defaultStyle.transform + " rotate(5deg)" : defaultStyle.transform,
        transition: "background-color 0.3s ease", // Transición para el cambio de color
    };
};

// Función para obtener el estilo del título de la lista
const getListTitleStyle = (isDragging, defaultStyle) => {
    return {
        ...defaultStyle,
        cursor: isDragging ? "grabbing" : "pointer",
    };
};

const List = ({ list, index }) => {
    const { board, setBoard } = useContext(globalContext);
    const [addingCard, setAddingCard] = useState(false);
    const [cardTitle, setCardTitle] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);

    // Lógica WIP
    const totalCards = list.items.length;
    const isOverWIP = totalCards >= list.maxWIP; // Verifica si se excede el WIP

    useBlurSetState(".list__add-card-form", addingCard, setAddingCard);
    useBlurSetState(".list__title-edit", editingTitle, setEditingTitle);

    const onAddCard = async (e) => {
        e.preventDefault();
        if (cardTitle.trim() === "") return;

        // Verifica si el límite de WIP ya se ha alcanzado
        if (isOverWIP) {
            alert("ALERTA WIP (work in progress): Límite de tareas alcanzado en esta lista.");
            return; // Sale sin enviar la solicitud al backend
        }

        // Si no se ha alcanzado el WIP, intenta agregar la tarjeta
        try {
            const { data } = await authAxios.post(`${backendUrl}/boards/items/`, {
                list: list.id,
                title: cardTitle,
            });
            setAddingCard(false);
            setCardTitle(""); // Limpiar el título de la tarjeta
            addCard(board, setBoard)(list.id, data);
        } catch (error) {
            console.error("Error al agregar la tarjeta:", error);
            alert("Hubo un problema al agregar la tarjeta.");
        }
    };

    const listCards = useRef(null);
    useEffect(() => {
        if (addingCard) listCards.current.scrollTop = listCards.current.scrollHeight;
    }, [addingCard]);

    useEffect(() => {
        if (editingTitle) {
            const editListTitle = document.querySelector(".list__title-edit");
            editListTitle.focus();
            editListTitle.select();
        }
    }, [editingTitle]);

    return (
        <Draggable draggableId={"list" + list.id.toString()} index={index}>
            {(provided, snapshot) => {
                return (
                    <div
                        className="list"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={getListStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style,
                            isOverWIP
                        )}
                    >
                        <div
                            className="list__title"
                            {...provided.dragHandleProps}
                            style={getListTitleStyle(
                                snapshot.isDragging,
                                provided.dragHandleProps.style
                            )}
                        >
                            {!editingTitle ? (
                                <p onClick={() => setEditingTitle(true)}>
                                    {list.title}
                                </p>
                            ) : (
                                <EditList
                                    list={list}
                                    setEditingTitle={setEditingTitle}
                                />
                            )}
                            <i className="far fa-ellipsis-h"></i>
                        </div>

                        {/* Mostramos una alerta visual si se excede el WIP */}
                        {isOverWIP && (
                            <div className="list__wip-alert">
                                <p>¡Has excedido el límite de tareas permitidas (WIP)!</p>
                            </div>
                        )}

                        <Droppable droppableId={list.id.toString()} type="item">
                            {(provided) => (
                                <div
                                    className="list__cards"
                                    ref={mergeRefs(
                                        provided.innerRef,
                                        listCards
                                    )}
                                    {...provided.droppableProps}
                                >
                                    {list.items.map((card, index) => (
                                        <DraggableCard
                                            card={card}
                                            list={list}
                                            index={index}
                                            key={uuidv4()}
                                        />
                                    ))}
                                    {provided.placeholder}
                                    {addingCard && (
                                        <AddCard
                                            onAddCard={onAddCard}
                                            cardTitle={cardTitle}
                                            setCardTitle={setCardTitle}
                                        />
                                    )}
                                </div>
                            )}
                        </Droppable>

                        {/* Deshabilitar botón si se excede el WIP */}
                        {!addingCard ? (
                            <button
                                className="list__add-card"
                                onClick={() => setAddingCard(true)}
                                disabled={isOverWIP} // Deshabilitar si se excede el WIP
                            >
                                {isOverWIP ? "Límite de WIP Excedido" : "Agregar Tarjeta"}
                            </button>
                        ) : cardTitle.trim() !== "" ? (
                            <button
                                className="list__add-card list__add-card--active btn"
                                onClick={onAddCard}
                            >
                                Agregar
                            </button>
                        ) : (
                            <button
                                className="list__add-card list__add-card--active btn btn--disabled"
                                disabled
                            >
                                Agregar
                            </button>
                        )}
                    </div>
                );
            }}
        </Draggable>
    );
};

export default List;

const AddCard = ({ onAddCard, cardTitle, setCardTitle }) => (
    <form className="list__add-card-form" onSubmit={onAddCard}>
        <input
            type="text"
            name="title"
            value={cardTitle}
            placeholder="Enter card title..."
            onChange={(e) => setCardTitle(e.target.value)}
        />
    </form>
);

const EditList = ({ list, setEditingTitle }) => {
    const { board, setBoard } = useContext(globalContext);
    const [listTitle, setListTitle] = useState(list.title);

    const onEditList = async (e) => {
        e.preventDefault();
        if (listTitle.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/lists/${list.id}/`,
            {
                title: listTitle,
            }
        );
        updateList(board, setBoard)(data);
        setEditingTitle(false);
    };

    return (
        <form onSubmit={onEditList}>
            <input
                className="list__title-edit"
                type="text"
                name="title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
            ></input>
        </form>
    );
};
