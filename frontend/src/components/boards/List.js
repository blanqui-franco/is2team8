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

const getListStyle = (isDragging, defaultStyle, isOverWIP) => ({
    ...defaultStyle,
    backgroundColor: isOverWIP ? "#ffcccc" : defaultStyle.backgroundColor,
    transform: isDragging ? defaultStyle.transform + " rotate(5deg)" : defaultStyle.transform,
    transition: "background-color 0.3s ease",
});

const getListTitleStyle = (isDragging, defaultStyle) => ({
    ...defaultStyle,
    cursor: isDragging ? "grabbing" : "pointer",
});

const List = ({ list, index }) => {
    const { board, setBoard } = useContext(globalContext);
    const [addingCard, setAddingCard] = useState(false);
    const [cardTitle, setCardTitle] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);

   
     // Asigna el límite de WIP con un valor predeterminado de 5 si no está definido
     const maxWIP = list.maxWIP || 5; 
     const totalCards = list.items.length;
     const isOverWIP = totalCards >= maxWIP;
    
   

    // Manejadores de eventos de enfoque y desenfoque
    useBlurSetState(".list__add-card-form", addingCard, setAddingCard);
    useBlurSetState(".list__title-edit", editingTitle, setEditingTitle);

    const onAddCard = async (e) => {
        e.preventDefault();
        if (cardTitle.trim() === "") return;

        // Verificación en el frontend del límite WIP antes de enviar la solicitud
        if (isOverWIP) {
            alert("ALERTA WIP: Límite de tareas alcanzado en esta lista.");
            return;
        }

        try {
            const { data } = await authAxios.post(`${backendUrl}/boards/items/`, {
                list: list.id,
                title: cardTitle,
            });
            setAddingCard(false);
            setCardTitle("");
            addCard(board, setBoard)(list.id, data);
        } catch (error) {
            console.error("Error al agregar la tarjeta:", error);
            alert("Hubo un problema al agregar la tarjeta.");
        }
    };

    const handleDeleteList = async (listId) => {
        
        if (window.confirm("¿Estás seguro de que quieres eliminar esta lista?")) {
            try {
                await authAxios.delete(`${backendUrl}/boards/lists/${listId}/`);
                // Filtra la lista eliminada y actualiza el estado del board
                const updatedBoard = {
                    ...board,
                    lists: board.lists.filter((l) => l.id !== listId),
                };
                setBoard(updatedBoard);
            } catch (error) {
                console.error("Error al eliminar la lista:", error);
                alert("No se pudo eliminar la lista. Intenta nuevamente.");
            }
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
            {(provided, snapshot) => (
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
                        {/* Botón de eliminar lista */}
                         <button onClick={() => handleDeleteList(list.id)} className="list__delete-button">
                             Eliminar
                        </button>
                    </div>


                    {/* Alerta visual cuando se excede el WIP */}
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

                    {/* Botón de agregar tarjeta con estado de WIP */}
                    {!addingCard ? (
                        <button
                            className="list__add-card"
                            onClick={() => setAddingCard(true)}
                            disabled={isOverWIP}
                        >
                            {isOverWIP ? "Límite de WIP Excedido" : "Agregar Tarjeta"}
                        </button>
                    ) : (
                        <button
                            className="list__add-card list__add-card--active btn"
                            onClick={onAddCard}
                            disabled={cardTitle.trim() === ""}
                        >
                            Agregar
                        </button>
                    )}
                </div>
            )}
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




