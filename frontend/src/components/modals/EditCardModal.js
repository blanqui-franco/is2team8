import React, { useEffect, useState, useContext, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import Labels from "../boards/Labels";
import useAxiosGet from "../../hooks/useAxiosGet";
import useBlurSetState from "../../hooks/useBlurSetState";
import globalContext from "../../context/globalContext";
import { timeSince, modalBlurHandler, authAxios } from "../../static/js/util";
import { backendUrl } from "../../static/js/const";
import { updateCard } from "../../static/js/board";
import ProfilePic from "../boards/ProfilePic";
import axios from 'axios';

const EditCardModal = ({ card, list, setShowModal , itemId,project}) => {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [dueDate, setDueDate] = useState(card.dueDate || "");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isOverdue, setIsOverdue] = useState(false);
    const { board, setBoard } = useContext(globalContext);
    const [tasks, setTasks] = useState(card.tasks || []);
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [showTaskForm, setShowTaskForm] = useState(false);

    const isMounted = useRef(true);

     // Estado para el miembro asignado y si estamos asignando
    const [assignedMember, setAssignedMember] = useState(card.assigned_to || null);
    const [isAssigning, setIsAssigning] = useState(false);
     // Manejo de asignación de miembros
    const handleAssignMember = async (member) => {
        try {
            const { data } = await authAxios.put(`${backendUrl}/boards/items/${card.id}/`, {
                assigned_to: member.id,
            });
            setAssignedMember(member); // Actualizar el miembro asignado en el estado local
            updateCard(board, setBoard)(list.id, data); // Actualizar el card en el estado general
            setIsAssigning(false); // Cerrar el selector de asignación
        } catch (error) {
            console.error("Error al asignar el miembro:", error);
        }
    };
    useEffect(() => {
        const checkDueDate = () => {
            const now = new Date();
            const selectedDate = new Date(dueDate);
            setIsOverdue(dueDate && selectedDate <= now);
        };
        checkDueDate();
    }, [dueDate, card.dueDate]); // Incluye `card.dueDate` para actualizar cuando cambie en el contexto
    

    useBlurSetState(".edit-modal__title-edit", editingTitle, setEditingTitle);
    useBlurSetState(".edit-modal__form", editingDescription, setEditingDescription);

    const {
        data: comments,
        addItem: addComment,
        replaceItem: replaceComment,
        removeItem: removeComment,
    } = useAxiosGet(`/boards/comments/?item=${card.id}`);

    

    const saveDueDate = async () => {
        if (!dueDate) {
            console.error("La fecha de vencimiento no puede ser nula");
            return;
        }
    
        try {
            const formattedDate = new Date(dueDate).toISOString();
    
            const response = await axios.put(`http://localhost:8000/boards/items/${itemId}/`, {
                dueDate: formattedDate,
            });
    
            console.log("Fecha de vencimiento guardada con éxito:", response.data);
        } catch (error) {
            console.error("Error al guardar la fecha límite:", error);
        }
    };
    

    const saveTasks = async (updatedTasks) => {
        try {
            console.log("Datos enviados en la solicitud PUT para las tareas:", { tasks: updatedTasks }); // Agregar console.log aquí
            const { data } = await authAxios.put(
                `${backendUrl}/boards/items/${card.id}/`,
                { tasks: updatedTasks }
            );
            updateCard(board, setBoard)(list.id, data);
        } catch (error) {
            console.error("Error al guardar las tareas:", error);
        }
    };
    

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskDescription.trim()) return;

        const newTask = {
            id: uuidv4(),
            description: newTaskDescription,
            status: 'open',
            dueDate: newTaskDueDate,
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);

        // Limpia los campos del formulario
        setNewTaskDescription("");
        setNewTaskDueDate("");
        setShowTaskForm(false);
    };

    const removeTask = async (taskId) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
    };

    const toggleTaskStatus = async (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: task.status === 'open' ? 'closed' : 'open' } : task
        );
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
    };

    const checkTaskDueDate = (dueDate) => {
        const now = new Date();
        return dueDate && new Date(dueDate) <= now;
    };

    return (
        <div className="edit-modal">
            <button className="edit-modal__exit" onClick={() => setShowModal(false)}>
                <i className="fal fa-times"></i>
            </button>
            <div className="edit-modal__cols">
                <div className="edit-modal__left">
                    <Labels labels={card.labels} />
                    {!editingTitle ? (
                        <p onClick={() => setEditingTitle(true)} className="edit-modal__title">
                            {card.title}
                        </p>
                    ) : (
                        <EditCardTitle
                            list={list}
                            card={card}
                            setEditingTitle={setEditingTitle}
                        />
                    )}
                    <div className="edit-modal__subtitle">
                        in list <span>{list.title}</span>
                    </div>

                    {isOverdue && (
                        <div className="edit-modal__overdue-alert">
                            ⚠️ ALERT: This task is overdue!
                        </div>
                    )}

                    <div className="edit-modal__section-header">
                        <div>
                            <i className="fal fa-file-alt"></i> Descripción
                        </div>
                        {card.description !== "" && (
                            <div>
                                <button
                                    className="btn btn--secondary btn--small"
                                    onClick={() => setEditingDescription(true)}
                                >
                                    <i className="fal fa-pencil"></i> Editar
                                </button>
                            </div>
                        )}
                    </div>

                    {card.description !== "" && !editingDescription && (
                        <p className="edit-modal__description">
                            {card.description}
                        </p>
                    )}

                    {editingDescription ? (
                        <EditCardDescription
                            list={list}
                            card={card}
                            setEditingDescription={setEditingDescription}
                        />
                    ) : (
                        card.description === "" && (
                            <button
                                className="btn btn--secondary btn--small btn--description"
                                onClick={() => setEditingDescription(true)}
                            >
                                Escribe una descripción
                            </button>
                        )
                    )}
                    <div className="edit-modal__section-header">
                        <div>
                            <i className="fal fa-tasks"></i> Tasks
                        </div>
                        <div>
                            <button className="btn btn--secondary btn--small" onClick={() => setShowTaskForm(true)}>
                                <i className="fal fa-plus"></i> Add Task
                            </button>
                        </div>
                    </div>

                    <ul className="edit-modal__tasks">
                        {tasks.map((task) => (
                            <li key={task.id} className={checkTaskDueDate(task.dueDate) ? "overdue" : ""}>
                                <input type="checkbox" checked={task.status === 'closed'} onChange={() => toggleTaskStatus(task.id)} />
                                <span>{task.description}</span>
                                {checkTaskDueDate(task.dueDate) && <span className="alert">⚠️ Overdue!</span>}
                                <button onClick={() => removeTask(task.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>

                    {showTaskForm && (
                        <form onSubmit={addTask}>
                            <input
                                type="text"
                                placeholder="Task description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                            />
                            <input
                                type="date"
                                value={newTaskDueDate}
                                onChange={(e) => setNewTaskDueDate(e.target.value)}
                            />
                            <button type="submit">Add Task</button>
                            <button type="button" onClick={() => setShowTaskForm(false)}>Cancelar</button>
                        </form>
                    )}

                    <div className="edit-modal__section-header">
                        <div>
                            <i className="fal fa-paperclip"></i> Comentarios
                        </div>
                    </div>

                    <CommentForm
                        card={card}
                        style={
                            (comments || []).length === 0
                                ? { marginBottom: 0 }
                                : null
                        }
                        addComment={addComment}
                    />
                         <Comments
                        card={card}
                        comments={comments || []}
                        replaceComment={replaceComment}
                        removeComment={removeComment}
                    />
                </div>

                <div className="edit-modal__right">
                    <div className="edit-modal__section-header">
                        <div>Actions</div>
                    </div>

                    <ul className="edit-modal__actions">
                            <li>
                                <a className="btn btn--secondary btn--small">
                                    <i className="fal fa-tags"></i> Edit Labels
                                </a>
                            </li>
                            <li>
                                <button
                                    className="btn btn--secondary btn--small"
                                    onClick={() => setIsAssigning(!isAssigning)}
                                >
                                    <i className="fal fa-user"></i> ASignar miembro
                                </button>
                            </li>
                            {/* Selección de miembros cuando se esté asignando */}
                            {isAssigning && (
                                <div className="edit-modal__member-list">
                                    <p>Seleccione un miembro:</p>
                                    <ul className="team__members-list">
                                        {project.members.map((member) => (
                                            <li
                                                key={member.id}
                                                className={`member-item ${assignedMember?.id === member.id ? "assigned" : ""}`}
                                                onClick={() => handleAssignMember(member)}
                                            >
                                                {member.full_name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <li>
                                <a className="btn btn--secondary btn--small">
                                    <i className="fal fa-arrow-right"></i> Move
                                </a>
                            </li>
                            <li style={{ position: "relative" }}>
                            <button
                                className="btn btn--secondary btn--small"
                                onClick={() => setShowDatePicker((prev) => !prev)}
                            >
                                <i className="fal fa-calendar-alt"></i> Due Date
                            </button>

                            {/* Muestra el selector de fecha cuando showDatePicker es true */}
                            {showDatePicker && (
                                <div className="date-picker">
                                    <input
                                        type="date"
                                        value={dueDate ? new Date(dueDate).toISOString().substr(0, 10) : ""}
                                        onChange={(e) => setDueDate(e.target.value)} // Solo actualiza el estado local
                                    />
                                    <button
                                        className="btn btn--small"
                                        onClick={saveDueDate} // Llama a saveDueDate al hacer clic en "Guardar"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            )}
                        </li>
                    </ul>
                     {/* Mostrar el miembro asignado actual */}
                     <Members members={assignedMember ? [assignedMember] : []} />
                    {/*<Members members={card.assigned_to || []} />*/}
                </div>
            </div>
        </div>  
        );
    };



const EditCardTitle = ({ list, card, setEditingTitle }) => {
    const { board, setBoard } = useContext(globalContext);
    const [title, setTitle] = useState(card.title);

    useEffect(() => {
        const titleInput = document.querySelector(".edit-modal__title-edit");
        titleInput.focus();
        titleInput.select();
    }, []);

    const onEditTitle = async (e) => {
        e.preventDefault();
        if (title.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title,
            }
        );
        setEditingTitle(false);
        updateCard(board, setBoard)(list.id, data);
    };

    return (
        <form onSubmit={onEditTitle}>
            <input
                className="edit-modal__title-edit"
                type="text"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
        </form>
    );
};

const EditCardDescription = ({ list, card, setEditingDescription }) => {
    const { board, setBoard } = useContext(globalContext);
    const [description, setDescription] = useState(card.description);

    const onEditDesc = async (e) => {
        e.preventDefault();
        if (description.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title: card.title,
                description,
            }
        );
        updateCard(board, setBoard)(list.id, data);
    };

    const onCancelEdit = () => {
        setEditingDescription(false); // Cierra el modo de edición sin guardar cambios
    };

    return (
        <form onSubmit={onEditDesc} className="edit-modal__form">
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <div className="edit-modal__form-actions">
                <button className="btn btn--small" type="submit">
                    Guardar
                </button>
                <button
                    className="btn btn--secondary btn--small"
                    type="button"
                    onClick={onCancelEdit}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

const Comments = ({ card, comments, replaceComment, removeComment }) => {
    const { authUser } = useContext(globalContext);
    const [isEditing, setIsEditing] = useState(false);
    useBlurSetState(".edit-modal__form--comment", isEditing, setIsEditing);

    if (comments.length === 0) return null;

    const onDelete = async (comment) => {
        await authAxios.delete(`${backendUrl}/boards/comments/${comment.id}/`);
        removeComment(comment.id);
    };

    return (
        <ul className="edit-modal__comments">
            {comments.map((comment) => (
                <li key={uuidv4()}>
                    <div className="comment">
                        <div className="comment__header">
                            <div className="comment__header-left">
                                <ProfilePic user={comment.author} />
                                <div className="comment__info">
                                    <p>{comment.author.full_name}</p>
                                    <p>{timeSince(comment.created_at)}</p>
                                </div>
                            </div>
                            {comment.author.username === authUser.username && (
                                <div className="comment__header-right">
                                    <button
                                        onClick={() => setIsEditing(comment.id)}
                                    >
                                        Edit
                                    </button>{" "}
                                    -{" "}
                                    <button onClick={() => onDelete(comment)}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditing !== comment.id ? (
                            <div className="comment__content">
                                {comment.body}
                            </div>
                        ) : (
                            <CommentForm
                                card={card}
                                comment={comment}
                                replaceComment={replaceComment}
                                setIsEditing={setIsEditing}
                            />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

const CommentForm = ({
    card,
    comment,
    style,
    addComment,
    replaceComment,
    setIsEditing,
}) => {
    // If comment not null, edit form
    const [commentBody, setCommentBody] = useState(comment ? comment.body : "");

    const onAddComment = async (e) => {
        e.preventDefault();
        if (commentBody.trim() === "") return;
        const { data } = await authAxios.post(
            `${backendUrl}/boards/comments/`,
            {
                item: card.id,
                body: commentBody,
            }
        );
        addComment(data);
        setCommentBody("");
    };

    const onEditComment = async (e) => {
        e.preventDefault();
        if (commentBody.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/comments/${comment.id}/`,
            {
                body: commentBody,
            }
        );
        replaceComment(data);
        setIsEditing(false);
    };

    // Modifier is only for useBlurSetState, as doc.querySelector is selecting description form otherwise
    // Only add if comment is not null, otherwise doc.querySelector selects create comment form
    return (
        <form
            className={`edit-modal__form${
                comment ? " edit-modal__form--comment" : ""
            }`}
            style={style}
            onSubmit={comment ? onEditComment : onAddComment}
        >
            <textarea
                placeholder="Deja un comentario..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
            ></textarea>
            {commentBody.trim() !== "" && (
                <button className="btn btn--small" type="submit">
                    Comment
                </button>
            )}
        </form>
    );
};

const Members = ({members = [] }) => {
    return (
        <div className="edit-modal__members">
            {members.map((member) => (
                <ProfilePic key={member.id} member={member} />
            ))}
        </div>
    );
};


export default EditCardModal;