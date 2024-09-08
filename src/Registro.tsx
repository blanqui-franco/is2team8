// src/Register.tsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Registro: React.FC = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '24rem' }}>
        <h2 className="card-title text-center">¿Ya tienes una cuenta?</h2>
        <div className="d-flex flex-column align-items-center">
          <button className="btn btn-primary w-100 mt-3">Registrarse</button>
        </div>
      </div>
    </div>
  );
};

export default Registro;
