import React, { useState } from "react";
import { backendUrl } from "../../static/js/const";
import { authAxios } from "../../static/js/util";

const getInviteMembersPosition = () => {
    const inviteElem = document.querySelector(".team__members-header button");
    if (!inviteElem) return null;
    return {
        top:
            inviteElem.getBoundingClientRect().y +
            inviteElem.getBoundingClientRect().height +
            10 +
            "px",
        left: inviteElem.getBoundingClientRect().x + "px",
    };
};

const InviteMembersModal = ({ project, setShowModal }) => {
    const [members, setMembers] = useState("");

    const handleInvite = async () => {
        const invitedMembers =
            members !== ""
                ? members.split(",").map((user) => user.trim()) // usernames and emails
                : [];

        try {
            await authAxios.post(
                backendUrl + `/projects/${project.id}/invite/`,
                {
                    users: invitedMembers,
                }
            );
        } catch (error) {
            console.log(error);
        }
        setShowModal(false);
    };

    return (
        <div
            className="label-modal label-modal--shadow"
            style={getInviteMembersPosition()}
        >
            <div className="label-modal__header">
                <p>Agregar Miembros</p>
                <button onClick={() => setShowModal(false)}>
                    <i className="fal fa-times"></i>
                </button>
            </div>
            <div className="label-modal__content">
                <p className="label-modal__invite-header">
                    <i className="fal fa-user"></i>
                    ingrese email o usario
                </p>
                <input
                    className="label-modal__input"
                    type="text"
                    name="members"
                    placeholder="ej. fatima@gmail.com"
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                />
                {members.trim() !== "" ? (
                    <button className="btn" onClick={handleInvite}>
                        Invitar al Proyecto
                    </button>
                ) : (
                    <button className="btn btn--disabled" disabled>
                        Invitar al Proyecto
                    </button>
                )}
            </div>
        </div>
    );
};

export default InviteMembersModal;
