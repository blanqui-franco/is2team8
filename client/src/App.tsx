import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserCrud from './UserCrud';
import RegisterLogin from './RegisterLogin';
import MainLayout from './MainLayout'; // Espacio de trabajo
import WorkspaceForm from './WorkspaceForm';
import CreateBoard from './BoardPage'; 
import BoardPage from './BoardPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/workspace" element={<WorkspaceForm />} /> 
        <Route path="/boards" element={<MainLayout  />} />
          {/* Ruta para acceder a un tablero específico */}
          <Route path="/board/:id" element={<BoardPage/>} />
      </Routes>
    </Router>
  );
}

export default App;