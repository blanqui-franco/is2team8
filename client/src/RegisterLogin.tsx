import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const RegisterLogin: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hasAccount, setHasAccount] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);  // Para almacenar usuarios
  const [newUsername, setNewUsername] = useState<string>(''); // Para nuevo usuario en CRUD
  const [newPassword, setNewPassword] = useState<string>(''); // Para contraseña de nuevo usuario

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUsers();  // Llamar a la funcion para obtener usuarios si el usuario ya está autenticado
    }
  }, []);

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
        fetchUsers();  // Llamar a la función para obtener usuarios después de iniciar sesión
      } else {
        const response = await axios.post('http://127.0.0.1:8000/register/', {
          username,
          password
        });
        localStorage.setItem('token', response.data.token);
        console.log('Registrarse:', response.data);
        fetchUsers();
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || 'Error en la autenticación');
      } else {
        setError('Error en la conexión con el servidor');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/get_all_users/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      setError('No se pudieron cargar los usuarios.');
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/get_all_users/', {
        username: newUsername,
        password: newPassword
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setUsers([...users, response.data]); // Actualizar la lista de usuarios con el nuevo
      setNewUsername('');
      setNewPassword('');
    } catch (error) {
      setError('Error al crear el usuario.');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/users/${id}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setUsers(users.filter(user => user.id !== id)); // Remover usuario de la lista
    } catch (error) {
      setError('Error al eliminar el usuario.');
    }
  };

  return (
    <div className="container">
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
            <div className="text-center mt-3">
              <span>{hasAccount ? '¿No tienes una cuenta? ' : '¿Ya tienes una cuenta? '}</span>
              <button
                className="btn btn-link p-0"
                onClick={() => setHasAccount(!hasAccount)}
              >
                {hasAccount ? 'Registrarse aquí' : 'Iniciar Sesión aquí'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {localStorage.getItem('token') && (
        <div className="mt-5">
          <h3>Lista de Usuarios</h3>
          <ul>
            {users.map(user => (
              <li key={user.id}>
                {user.username}
                <button onClick={() => deleteUser(user.id)} className="btn btn-danger ms-2">Eliminar</button>
              </li>
            ))}
          </ul>
          
          <h3>Crear Nuevo Usuario</h3>
          <input
            type="text"
            placeholder="Nuevo nombre de usuario"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={createUser} className="btn btn-success">Crear Usuario</button>
        </div>
      )}
    </div>
  );
};

export default RegisterLogin;
