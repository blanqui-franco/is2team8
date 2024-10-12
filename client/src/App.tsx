import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Cambia Switch por Routes
import UserCrud from './UserCrud';
import RegisterLogin from './RegisterLogin';
import MainLayout from './MainLayout'; // Espacio de trabajo

/*const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/crud" element={<UserCrud />} />
      </Routes>
    </Router>
  );
};*/

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/workspace" element={<MainLayout />} /> 
      </Routes>
    </Router>
  );
}

export default App;
