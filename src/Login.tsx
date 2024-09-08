// src/Login.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para autenticar al usuario
    console.log({ username, password });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '24rem' }}>
        <h2 className="card-title text-center">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre de Usuario:</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-2"
            onClick={() => window.location.href = '/sso'}
          >
            Iniciar Sesión con SSO
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
