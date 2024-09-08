import React from 'react';
import Registro from './Registro';
import Login from './Login';
import './App.css';
import RegisterLogin from './RegisterLogin';

const App: React.FC = () => {
  return (
    <div className="App">
      <RegisterLogin />
    </div>
  );
};

export default App;