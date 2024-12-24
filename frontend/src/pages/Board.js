import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useBlurSetState from "../hooks/useBlurSetState";
import useAxiosGet from "../hooks/useAxiosGet";
import { onAddList, onDragEnd } from "../static/js/board";
import List from "../components/boards/List";
import { authAxios, handleBackgroundBrightness } from "../static/js/util";
import { backendUrl } from "../static/js/const";
import Error404 from "./Error404";
import globalContext from "../context/globalContext";

const getBoardStyle = (board) => {
    if (board.image || board.image_url)
        return {
            backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25) ), url(${
                board.image || board.image_url
            })`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center center",
        };
    else if (board.color)
        return {
            backgroundColor: `#${board.color}`,
        };
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
    useEffect(handleBackgroundBrightness(board, setIsBackgroundDark), [board]);

    
    // Estado para el menú de filtros
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };




    if (!board && loading) return null;
    if (!board && !loading) return <Error404 />;
    return (
        <div className="board" style={getBoardStyle(board)}>
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
            <button
                    className="btn board__filter-btn"
                    onClick={toggleFilters}
                    style={isBackgroundDark ? { color: "white" } : null}
                >
                    <i className="fas fa-filter"></i>
                </button>
                {showFilters && (
                    <div className="board__filter-menu">
                        {/* Opciones de filtro */}
                        <p onClick={() => console.log("Filtrar por etiqueta")}>
                            Filtrar por etiqueta
                        </p>
                        <p onClick={() => console.log("Filtrar por vencidas")}>
                            Filtrar por vencidas
                        </p>
                    </div>
                )}
            <p className="board__subtitle">{board.owner.title}</p>

            {/* Enlace al Dashboard */}
            <Link to={`/b/${board.id}/dashboard`} className="board__dashboard-link">
                Ver Dashboard
            </Link>

            <DragDropContext onDragEnd={onDragEnd(board, setBoard)}>
                <Droppable
                    droppableId={"board" + board.id.toString()}
                    direction="horizontal"
                    type="list"
                >
                    {(provided) => (
                        <div
                            className="board__lists"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {board.lists.map((list, index) => (
                                <List
                                    list={list}
                                    index={index}
                                    key={uuidv4()}
                                />
                            ))}
                            {provided.placeholder}
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
                                    style={
                                        board.lists.length === 0
                                            ? { marginLeft: 0 }
                                            : null
                                    }
                                >
                                    <i className="fal fa-plus"></i>
                                    Add{" "}
                                    {board.lists.length === 0
                                        ? "a"
                                        : "another"}{" "}
                                    list
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
    const [maxWip, setMaxWip] = useState(""); // Nuevo estado para el límite WIP

    const onAddList = async (e) => {
        e.preventDefault();
        if (!maxWip || maxWip <= 0) {
            alert("Please enter a valid WIP limit greater than 0.");
            return;
        }

        const { data } = await authAxios.post(`${backendUrl}/boards/lists/`, {
            board: board.id,
            title,
            max_wip: maxWip, // Enviar el límite WIP al backend
        });

        setBoard((prevBoard) => ({
            ...prevBoard,
            lists: [...prevBoard.lists, data],
        }));
        setAddingList(false);
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
                placeholder="Ingrese el limite WIP "
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
        const { data } = await authAxios.put(
            `${backendUrl}/boards/${board.id}/`,
            {
                title,
            }
        );
        setBoard(data);
        setEditingTitle(false);
    };

    return (
        <form onSubmit={onEditTitle}>
            <input
                className="board__title-edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                name="title"
                placeholder="Enter board title"
            />
        </form>
    );
};

export default Board;
