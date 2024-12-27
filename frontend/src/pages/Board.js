import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useBlurSetState from "../hooks/useBlurSetState";
import useAxiosGet from "../hooks/useAxiosGet";
import { addList, onDragEnd } from "../static/js/board";
import List from "../components/boards/List";
import { authAxios, handleBackgroundBrightness } from "../static/js/util";
import { backendUrl } from "../static/js/const";
import Error404 from "./Error404";
import globalContext from "../context/globalContext";

const getBoardStyle = (board) => {
    if (board.image || board.image_url) {
        return {
            backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25) ), url(${
                board.image || board.image_url
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center center",
        };
    } else if (board.color) {
        return {
            backgroundColor: `#${board.color}`,
        };
    }
};

const Board = (props) => {
    const { id } = props.match.params;
    const [addingList, setAddingList] = useState(false);
    const { data: board, setData: setBoard, loading } = useAxiosGet(
        `/boards/${id}/`
    );

    const { setBoardContext } = useContext(globalContext);
    useEffect(() => {
        if (board) {
            setBoardContext(board, setBoard);
        }
    }, [board]);

    useDocumentTitle(board ? `${board.title} | YvyPlan` : "");
    useBlurSetState(".board__create-list-form", addingList, setAddingList);
    const [editingTitle, setEditingTitle] = useState(false);
    useBlurSetState(".board__title-edit", editingTitle, setEditingTitle);

    const [isBackgroundDark, setIsBackgroundDark] = useState(false);
    useEffect(() => {
        handleBackgroundBrightness(board, setIsBackgroundDark);
    }, [board]);

    const [showFilters, setShowFilters] = useState(false);
    const [filteredLists, setFilteredLists] = useState(null);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const filterOverdueItems = () => {
        if (!board || !Array.isArray(board.lists)) {
            console.error("El tablero o las listas no están definidos o no son válidos.");
            return;
        }
    
        const now = new Date();
        const overdueLists = board.lists.map((list) => {
            if (!Array.isArray(list.items)) {
                console.warn(`Los items de la lista ${list.id || "sin id"} no son un array.`);
                return { ...list, items: [] }; // No mostrar items si no es un array
            }
    
            // Filtrar los items vencidos
            const overdueItems = list.items.filter((item) => {
                const dueDate = new Date(item.due_date);
                if (!item.due_date || isNaN(dueDate)) {
                    console.warn(`El item ${item.id || "sin id"} tiene una fecha no válida.`);
                    return false; // Ignorar items sin fecha de vencimiento válida
                }
                return dueDate < now; // Solo items vencidos
            });
    
            return { ...list, items: overdueItems }; // Retorna las listas con los items vencidos
        });
    
        console.log("Listas filtradas:", overdueLists);
        setFilteredLists(overdueLists); // Actualizar el estado con las listas filtradas
    };
    
    const clearFilters = () => {
        setFilteredLists(null);
    };

    if (!board && loading) return null;
    if (!board && !loading) return <Error404 />;

    const listsToDisplay = filteredLists || board.lists;

    return (
        <div className="board" style={getBoardStyle(board)}>
            {/* Título del tablero */}
            {!editingTitle ? (
                <p
                    className="board__title"
                    onClick={() => setEditingTitle(true)}
                    style={isBackgroundDark ? { color: "white" } : null}
                >
                    {board.title}
                </p>
            ) : (
                <EditBoard
                    setEditingTitle={setEditingTitle}
                    board={board}
                    setBoard={setBoard}
                />
            )}
    
            {/* Botón para mostrar/ocultar el filtro */}
            <button
                className="btn board__filter-btn"
                onClick={toggleFilters}
                style={isBackgroundDark ? { color: "white" } : null}
            >
                <i className="fas fa-filter"></i>
            </button>
    
            {/* Menú de filtros */}
            {showFilters && (
                <div className="board__filter-menu">
                    <p onClick={filterOverdueItems}>Filtrar por vencidos</p>
                    <p onClick={clearFilters}>Limpiar filtros</p>
                </div>
            )}
    
            <p className="board__subtitle">{board.owner.title}</p>
    
            <Link to={`/b/${board.id}/dashboard`} className="board__dashboard-link">
                Ver Dashboard
            </Link>
    
            {/* Drag and Drop de listas */}
            <DragDropContext onDragEnd={(result) => onDragEnd(result, board, setBoard)}>
                <Droppable
                    droppableId={`board${board.id}`}
                    direction="horizontal"
                    type="list"
                >
                    {(provided) => (
                        <div
                            className="board__lists"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {/* Mostrar las listas filtradas o todas las listas */}
                            {listsToDisplay.map((list, index) => (
                                <List
                                    list={list}
                                    index={index}
                                    key={list.id || uuidv4()}
                                />
                            ))}
                            {provided.placeholder}
                            {/* Formulario para agregar nuevas listas */}
                            {addingList ? (
                                <CreateList
                                    board={board}
                                    setBoard={setBoard}
                                    setAddingList={setAddingList}
                                />
                            ) : (
                                <button
                                    className="btn board__create-list"
                                    onClick={() => setAddingList(true)}
                                    style={board.lists.length === 0 ? { marginLeft: 0 } : null}
                                >
                                    <i className="fal fa-plus"></i>
                                    Agregar {board.lists.length === 0 ? "a" : "otra"} lista
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

const CreateList = ({ board, setBoard, setAddingList }) => {
    const [title, setTitle] = useState("");
    const [maxWip, setMaxWip] = useState("");

    const onAddList = async (e) => {
        e.preventDefault();
        if (!maxWip || maxWip <= 0) {
            alert("Ingrese un límite WIP válido mayor a 0.");
            return;
        }

        try {
            const { data } = await authAxios.post(`${backendUrl}/boards/lists/`, {
                board: board.id,
                title,
                max_wip: maxWip,
            });

            setBoard((prevBoard) => ({
                ...prevBoard,
                lists: [...prevBoard.lists, data],
            }));
            setAddingList(false);
        } catch (error) {
            alert("Error al crear la lista. Por favor, inténtelo de nuevo.");
        }
    };

    return (
        <form className="board__create-list-form" onSubmit={onAddList}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                placeholder="Ingrese el nombre de la lista"
                required
            />
            <input
                value={maxWip}
                onChange={(e) => setMaxWip(e.target.value)}
                type="number"
                placeholder="Ingrese el limite WIP"
                required
                min={1}
            />
            <button
                type="submit"
                className="btn btn--small"
                disabled={!title.trim() || !maxWip || maxWip <= 0}
            >
                Agregar Lista
            </button>
        </form>
    );
};

const EditBoard = ({ board, setBoard, setEditingTitle }) => {
    const [title, setTitle] = useState(board.title);

    const onEditTitle = async (e) => {
        e.preventDefault();
        if (title.trim() === "") return;
        try {
            const { data } = await authAxios.put(
                `${backendUrl}/boards/${board.id}/`,
                {
                    title,
                }
            );
            setBoard(data);
            setEditingTitle(false);
        } catch (error) {
            alert("Error al actualizar el título. Por favor, inténtelo de nuevo.");
        }
    };

    return (
        <form onSubmit={onEditTitle}>
            <input
                className="board__title-edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                name="title"
                placeholder="Ingrese el título del tablero"
            />
        </form>
    );
};

export default Board;
