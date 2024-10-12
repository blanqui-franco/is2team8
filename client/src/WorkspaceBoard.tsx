// WorkspaceBoard.tsx
import React from 'react';

const WorkspaceBoard: React.FC = () => {
  return (
    <div className="workspace-board p-4">
      <h1>Tableros</h1>
      <div className="d-flex flex-wrap">
        {/* Tablero de ejemplo */}
        <div className="card m-3" style={{ width: '18rem' }}>
          <div className="card-body">
            <h5 className="card-title">Mi Tablero de Prueba</h5>
            <p className="card-text">Descripción breve del tablero.</p>
            <a href="#" className="btn btn-primary">Abrir Tablero</a>
          </div>
        </div>
        {/* Botón para crear un nuevo tablero */}
        <div className="card m-3" style={{ width: '18rem', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn btn-success">Crear Tablero Nuevo</button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBoard;
