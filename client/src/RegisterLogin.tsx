import React, { useState, FormEvent, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const RegisterLogin: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>(''); // Solo para el formulario de registro
  const [hasAccount, setHasAccount] = useState<boolean>(true); // true = Login, false = Registro
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (hasAccount) {
        const response = await axios.post('http://127.0.0.1:8000/login/', {
          username,
          password
        });
        localStorage.setItem('token', response.data.token);
        console.log('Iniciar Sesión:', response.data);
        //navigate('/crud'); // Redirigir después del login
        navigate('/workspace');
      } else {
        const response = await axios.post('http://127.0.0.1:8000/register/', {
          username,
          password,
          email
        });
        localStorage.setItem('token', response.data.token);
        console.log('Registro exitoso:', response.data);
        //navigate('/crud'); // Redirigir después del registro
        setHasAccount(true);
        setError(null); 
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || 'Error en la autenticación');
      } else {
        setError('Error en la conexión con el servidor');
      }
    }
  };
  // Función para manejar el inicio de sesión con Google SSO
  const handleGoogleLogin = (credentialResponse: any) => {
    axios
      .post('http://127.0.0.1:8000/google-login/', {
        token: credentialResponse.credential,
      })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        navigate('/workspace'); // Redirigir al espacio de trabajo después de login con Google
      })
      .catch((error) => {
        console.log('Error con Google SSO', error);
        setError('Error al iniciar sesión con Google.');
      });
  };


  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_DE_GOOGLE">
      <div className="container">
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="card p-4" style={{ width: '24rem' }}>
            <h2 className="card-title text-center">
              {hasAccount ? 'Iniciar Sesión' : 'Registrarse'}
            </h2>
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Nombre de usuario */}
              <div className="mb-3">
                <label className="form-label" htmlFor="username">
                  Nombre de Usuario:
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Email solo en el formulario de registro */}
              {!hasAccount && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Correo Electrónico:</label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Contraseña */}
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Botón de enviar */}
              <button type="submit" className="btn btn-primary w-100">
                {hasAccount ? 'Iniciar Sesión' : 'Registrarse'}
              </button>

              {/* Alternar entre iniciar sesión y registrarse */}
              <div className="text-center mt-3">
                <span>{hasAccount ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}</span>
                <button
                  className="btn btn-link p-0"
                  type="button"
                  onClick={() => setHasAccount(!hasAccount)}
                >
                  {hasAccount ? 'Registrarse aquí' : 'Iniciar Sesión aquí'}
                </button>
              </div>
            </form>

            {/* Google Login */}
            <div className="text-center mt-3">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Error al iniciar sesión con Google')}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default RegisterLogin;