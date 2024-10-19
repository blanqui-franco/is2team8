import React, { useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserListProps {
  users: User[];
  onUserSelection: (users: User[]) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelection }) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSelectUser = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = () => {
    onUserSelection(selectedUsers);
  };

  return (
    <>
      <ListGroup>
        {users.map((user) => (
          <ListGroup.Item
            key={user.id}
            onClick={() => handleSelectUser(user)}
            active={selectedUsers.some(u => u.id === user.id)}
            style={{ cursor: 'pointer' }}
          >
            {user.username}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Button className="mt-3" onClick={handleSubmit}>
        Asignar usuarios
      </Button>
    </>
  );
};

export default UserList;
