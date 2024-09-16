import React, { useState, FormEvent, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const RegisterLogin: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasAccount, setHasAccount] = useState<boolean>(true); // Para alternar entre login y registro
  const [error, setError] = useState<string | null>(null); // Para manejar errores

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (hasAccount) {
        // Lógica para iniciar sesión
        const response = await axios.post('http://127.0.0.1:8000/login/', { // URL de tu API
          username,
          password
        });

        // Guardar el token en localStorage para usarlo en otras peticiones
        localStorage.setItem('token', response.data.token);
        console.log('Iniciar Sesión:', response.data);

      } else {
        // Lógica para registro
        const response = await axios.post('http://127.0.0.1:8000/register/', { // URL de tu API
          username,
          password
        });

        // Guardar el token en localStorage después de registrarse
        localStorage.setItem('token', response.data.token);
        console.log('Registrarse:', response.data);
      }
    } catch (error: any) {
      // Si ocurre un error, lo mostramos
      if (error.response) {
        setError(error.response.data.error || 'Error en la autenticación');
      } else {
        setError('Error en la conexión con el servidor');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '24rem' }}>
        <h2 className="card-title text-center">
          {hasAccount ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
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
          {hasAccount && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => window.location.href = '/sso'}
            >
              Iniciar Sesión con SSO
            </button>
          )}
          {!hasAccount && (
            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={() => window.location.href = '/sso'}
            >
              Registrarse con SSO
            </button>
          )}
        </form>
        <div className="text-center mt-3">
          <span>
            {hasAccount ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}
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
