import React, { useState, useEffect, useRef, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

import { modalBlurHandler, mergeRefs, authAxios } from "../../static/js/util";
import Labels from "./Labels";
import ProfilePic from "./ProfilePic";
import EditCardModal from "../modals/EditCardModal";
import LabelModal from "../modals/LabelModal";
import { backendUrl } from "../../static/js/const";
import { updateCard } from "../../static/js/board";
import globalContext from "../../context/globalContext";

const getCardStyle = (isDragging, isEditing, defaultStyle) => {
    if (isEditing) {
        return {
            cursor: "auto",
        };
    }
    if (!isDragging)
        return {
            ...defaultStyle,
            cursor: "pointer",
        };
    return {
        ...defaultStyle,
        transform: defaultStyle.transform + " rotate(5deg)",
        cursor: "grabbing",
    };
};

const Card = ({ card, list, provided, isDragging }) => {
    const { board, setBoard,project } = useContext(globalContext);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
  //  const { project } = useContext(globalContext);
    console.log("Project que se pasa a EditCardModal:", project);

    const [showEditModal, setShowEditModal] = useState(false);
    const [showLabelModal, setShowLabelModal] = useState(false);

    const cardElem = useRef(null);

    const handleCardClick = (e) => {
        if (isEditing) return;
        if (e.target.className.includes("pen")) return;
        setShowEditModal(true);
    };
    useEffect(() => {
        console.log("Project dentro de Cssard:", project); // Debug
    }, [project]);
    useEffect(() => {
        if (!isEditing) {
            setShowLabelModal(false);
        } else {
            const editCardTitle = document.querySelector(".card__title-edit");
            editCardTitle.focus();
            editCardTitle.select();
        }
    }, [isEditing]);

    const onEditCard = async (e) => {
        e.preventDefault();
        if (title.trim() === "") return;
        const { data } = await authAxios.put(
            `${backendUrl}/boards/items/${card.id}/`,
            {
                title,
            }
        );
        setIsEditing(false);
        updateCard(board, setBoard)(list.id, data);
    };

    const { innerRef, draggableProps, dragHandleProps } = provided;

    const cardImage = card.image || card.image_url || card.color;
    return (
        <>
            <div
                className={`card${cardImage ? " card--image" : ""}${
                    isEditing ? " card--edit" : ""
                }`}
                ref={mergeRefs(cardElem, innerRef)}
                onClick={handleCardClick}
                {...draggableProps}
                style={getCardStyle(
                    isDragging,
                    isEditing,
                    draggableProps.style
                )}
                {...dragHandleProps}
            >
                {cardImage &&
                    (card.color ? (
                        <div
                            className="card__color"
                            style={{ backgroundColor: `#${card.color}` }}
                        ></div>
                    ) : (
                        <div className="card__image">
                            <img src={cardImage} alt='imagen card'/>
                        </div>
                    ))}
                <div>
                    {!isEditing && (
                        <button
                            className="card__pen"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="fal fa-pen"></i>
                        </button>
                    )}
                    <Labels labels={card.labels} />
                    {isEditing ? (
                        <form onSubmit={onEditCard}>
                            <input
                                className="card__title-edit"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </form>
                    ) : (
                        <p className="card__title">{card.title}</p>
                    )}
                    {card.attachments?.length !== 0 && (
                        <p className="card__subtitle">
                            <i className="fal fa-paperclip"></i>{" "}
                            {card.attachments.length}
                        </p>
                    )}
                    <Members members={card.assigned_to || []} />
                    {isEditing && (
                        <>
                            <EditControls
                                onEditCard={onEditCard}
                                cardElem={cardElem}
                                setShowModal={setIsEditing}
                                setShowLabelModal={setShowLabelModal}
                            />
                            {showLabelModal && (
                                <LabelModal
                                    card={card}
                                    list={list} 
                                    cardElem={cardElem}
                                    setShowModal={setShowLabelModal}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            {showEditModal && (
                <EditCardModal
                    card={card}
                    setShowModal={setShowEditModal}
                    list={list}
                    itemId={card.id}
                    project={project}
                    
                    
                />           
)}
            
        </>
        
    );
};

const Members = ({ members = [] }) => { 
    if (!Array.isArray(members)) {
        console.error("Members no es un arreglo en card.js:", members);
        members = members ? [members] : []; // Asegura un arreglo vacío si `members` es null
    }
    return (
        <div className="card__members">
            {members.map((member) => (
                <ProfilePic user={member} key={member.id} />
            ))}
        </div>
    );
};


export const getEditControlsSidePosition = (cardElem, offset = 0) => {
    // pass in ref.current
    if (!cardElem) return null;
    return {
        top: cardElem.getBoundingClientRect().y + offset + "px",
        left:
            cardElem.getBoundingClientRect().x +
            cardElem.getBoundingClientRect().width +
            10 +
            "px",
    };
};

const EditControls = ({
    onEditCard,
    cardElem,
    setShowModal,
    setShowLabelModal,
}) => {
    useEffect(modalBlurHandler(setShowModal), []);
    return (
        <div className="card__edit-controls">
            <button onClick={onEditCard} className="btn">
                Save
            </button>
            <ul
                className="card__edit-controls-side"
                style={getEditControlsSidePosition(cardElem.current)}
            >
                <li>
                    <button onClick={() => setShowLabelModal(true)}>
                        <i className="fal fa-tags"></i> Edit Labels
                    </button>
                </li>
                <li>
                    <i className="fal fa-user"></i> Asignar Usuario
                </li>
                <li>
                    <i className="fal fa-arrow-right"></i> Move
                </li>
                <li>
                    <i className="fal fa-clock"></i> Change Due Date
                </li>
            </ul>
        </div>
    );
};

export default Card;