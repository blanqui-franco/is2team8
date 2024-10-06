// MainLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';  // La barra lateral
import WorkspaceBoard from './WorkspaceBoard';  // Tableros

const MainLayout: React.FC = () => {
  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Barra lateral */}
      <Sidebar />
      
      {/* Contenido principal: Tableros */}
      <div className="flex-grow-1 p-4">
        <WorkspaceBoard />
      </div>
    </div>
  );
};

export default MainLayout;
