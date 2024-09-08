import React, { useState, FormEvent, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegisterLogin: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasAccount, setHasAccount] = useState<boolean>(true); 

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (hasAccount) {
      // Lógica de autenticación para iniciar sesión
      console.log('Iniciar Sesión:', { username, password });
    } else {
      // Lógica de autenticación para registro
      console.log('Registrarse:', { username, password });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '24rem' }}>
        <h2 className="card-title text-center">
          {hasAccount ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
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
          <button type="submit" className="btn btn-primary w-100">
            {hasAccount ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
          {!hasAccount && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => window.location.href = '/sso'}
            >
              Registrarse con SSO
            </button>
          )}
          {hasAccount && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => window.location.href = '/sso'}
            >
              Iniciar Sesión con SSO
            </button>
          )}
        </form>
        <div className="text-center mt-3">
          <span>
            {hasAccount
              ? '¿No tienes una cuenta? '
              : '¿Ya tienes una cuenta? '}
          </span>
          <button
            className="btn btn-link p-0"
            onClick={() => setHasAccount(!hasAccount)}
          >
            {hasAccount ? 'Registrarse aquí' : 'Iniciar Sesión aquí'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterLogin;
