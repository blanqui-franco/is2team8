import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar bg-dark text-light p-3" style={{ width: '250px', height: '100vh' }}>
      <h2>Tableros</h2>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/boards" className="nav-link text-light">Tableros</Link>
        </li>
        <li className="nav-item">
          <Link to="/members" className="nav-link text-light">Miembros</Link>
        </li>
        <li className="nav-item">
          <Link to="/settings" className="nav-link text-light">Ajustes</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
