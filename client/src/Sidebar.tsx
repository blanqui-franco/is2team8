// Sidebar.tsx
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar bg-dark text-light p-3" style={{ width: '250px', height: '100vh' }}>
      <h2>Tableros</h2>
      <ul className="nav flex-column">
        <li className="nav-item">
          <a className="nav-link text-light" href="#">Tableros</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-light" href="#">Miembros</a>
        </li>
        <li className="nav-item">
          <a className="nav-link text-light" href="#">Ajustes</a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
