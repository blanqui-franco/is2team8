import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Cambia Switch por Routes
import UserCrud from './UserCrud';
import RegisterLogin from './RegisterLogin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterLogin />} />
        <Route path="/crud" element={<UserCrud />} />
      </Routes>
    </Router>
  );
};

export default App;
