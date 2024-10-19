// TopBar.tsx
import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="top-bar bg-primary text-light p-3 d-flex justify-content-between align-items-center">
      <h2>Mi Espacio de Trabajo</h2>
      <div>
        <button className="btn btn-outline-light">Invitar a Miembros</button>
        <button className="btn btn-light ml-2">Perfil</button>
      </div>
    </div>
  );
};

export default TopBar;