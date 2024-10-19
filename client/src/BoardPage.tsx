import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const BoardPage: React.FC = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [boardName, setBoardName] = useState('');

  const handleCreateBoard = () => {
    // Lógica para crear un nuevo tablero
    console.log('Nuevo tablero creado:', boardName);
    setBoardName('');
    setShowModal(false);
  };

  return (
    <div className="board-page">
      <h2>Tablero {id}</h2>
      <img src="/vite.svg" alt="Vite Logo" style={{ width: '100px', height: '100px' }} />
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Crear Tablero Nuevo
      </button>

      {/* Modal para crear tablero */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nuevo Tablero</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre del tablero"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleCreateBoard}>
                  Crear Tablero
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aquí puedes renderizar las listas y tarjetas del tablero */}
    </div>
  );
};

export default BoardPage;
