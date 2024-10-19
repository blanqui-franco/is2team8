// WorkspaceBoard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const WorkspaceBoard: React.FC = () => {
  const [boards, setBoards] = useState<any[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/boards/', {
          headers: { Authorization: `Token ${token}` }
        });
        setBoards(response.data);
      } catch (error) {
        console.error('Error al obtener tableros:', error);
      }
    };
    fetchBoards();
  }, []);

  return (
    <div className="workspace-board p-4">
      <h1>Tableros</h1>
      <div className="d-flex flex-wrap">
        {boards.map(board => (
          <div key={board.id} className="card m-3" style={{ width: '18rem' }}>
            <div className="card-body">
              <h5 className="card-title">{board.name}</h5>
              <Link to={`/board/${board.id}`} className="btn btn-primary">Abrir Tablero</Link>
            </div>
          </div>
        ))}
        <div className="card m-3" style={{ width: '18rem', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link to="/boards/create" className="btn btn-success">Crear Tablero Nuevo</Link>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBoard;
