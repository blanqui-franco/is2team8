import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get('http://127.0.0.1:8000/get_all_users/');
    setUsers(response.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://127.0.0.1:8000/delete_user/${id}/`);
    fetchUsers();
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username}
            <button onClick={() => deleteUser(user.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
