// src/components/modals/LogoutModal.js
import React from 'react';

const LogoutModal = ({ setShowModal, onLogout }) => {
    return (
        <div className="modal">
            <div className="modal__content">
                <h2>¿Seguro que quieres cerrar sesión?</h2>
                <button className="btn" onClick={onLogout}>Cerrar Sesión</button>
                <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
        </div>
    );
};

export default LogoutModal;
