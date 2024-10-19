import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';  // Importar el componente UserList
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

const WorkspaceForm: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);  // Estado para usuarios seleccionados
  const [users, setUsers] = useState<User[]>([]);  // Estado para la lista de usuarios
  const navigate = useNavigate();  // Para redirigir después de crear

  // Función para manejar la selección de usuarios desde UserList
  const handleUserSelection = (users: User[]) => {
    setSelectedUsers(users);
  };

  // Obtener la lista de usuarios al montar el componente
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/get_all_users/', {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      setUsers(response.data);  // Asume que response.data es un array de objetos User
    })
    .catch(error => {
      console.error('Error al obtener los usuarios:', error);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Datos del espacio de trabajo y usuarios seleccionados
    const workspaceData = {
      name: workspaceName,
      description: description,
      users: selectedUsers.map(user => user.id),  // Enviar solo los IDs de los usuarios
    };

    // Enviar los datos al backend para crear el espacio de trabajo
    axios.post('http://127.0.0.1:8000/workspaces/', workspaceData, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      console.log('Espacio de trabajo creado:', response.data);
      // Redirigir a la página de tableros después de la creación
      navigate('/boards');
    })
    .catch(error => {
      console.error('Error al crear el espacio de trabajo:', error);
    });
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh', backgroundColor: '#f5faff' }}
    >
      <Row
        className="shadow-lg p-5 bg-white rounded"
        style={{ maxWidth: '800px', borderRadius: '15px' }}
      >
        <Col md={6}>
          <h2 className="mb-4" style={{ fontWeight: 600 }}>Vamos a crear un Espacio de trabajo</h2>
          <p className="text-muted mb-4" style={{ fontSize: '16px' }}>
            Impulsa tu productividad facilitándoles a todos el acceso a los tableros en una única ubicación.
          </p>

          {/* Formulario */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500' }}>Nombre del Espacio de trabajo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Introduce un nombre"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500' }}>Descripción <span className="text-muted">(Opcional)</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descripción del espacio de trabajo"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            {/* Aquí se muestra el componente UserList */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500' }}>Seleccionar Usuarios</Form.Label>
              <UserList users={users} onUserSelection={handleUserSelection} />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              style={{ padding: '10px', fontWeight: '600' }}
            >
              Crear Espacio de trabajo
            </Button>
          </Form>
        </Col>

        {/* Columna para la imagen */}
        <Col md={6} className="d-flex justify-content-center align-items-center">
          <div className="text-center">
            <img
              src="https://via.placeholder.com/250x150"
              alt="Workspace Graphic"
              style={{ maxWidth: '100%' }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkspaceForm;
