import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import { app } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const db = getFirestore(app);
const auth = getAuth(app);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'roles', currentUser.email); // Referencia al documento específico
        const userDoc = await getDoc(userDocRef); // Obtener el documento individual

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true); // Usuario es admin
        } else {
          navigate('/not-authorized'); // Redirigir si no es admin
        }
      } else {
        navigate('/login'); // Redirigir si no hay sesión activa
      }
    };

    fetchCurrentUserRole();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const rolesCollection = collection(db, 'roles');
      const snapshot = await getDocs(rolesCollection);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Mostrar modal para ver detalles del usuario
  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Función para editar el rol del usuario
  const handleEditUser = async (email) => {
    try {
      const rolesCollection = collection(db, 'roles');
      await setDoc(doc(rolesCollection, email), { role: editRole }, { merge: true });
      setUsers(prev => prev.map(user => user.email === email ? { ...user, role: editRole } : user));
      setEditRole('');
    } catch (error) {
      console.error('Error actualizando rol del usuario:', error);
    }
  };

  // Función para eliminar el usuario
  const handleDeleteUser = async (email) => {
    try {
      const rolesCollection = collection(db, 'roles');
      await deleteDoc(doc(rolesCollection, email));
      setUsers(prev => prev.filter(user => user.email !== email));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };

  if (!isAdmin) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h2>Administrar Usuarios</h2>

      {/* Lista de usuarios */}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} - {user.role}
            <Button onClick={() => handleShowModal(user)}>Ver Detalles</Button>
            <Button onClick={() => { setSelectedUser(user); setEditRole(user.role); }}>Editar</Button>
            <Button onClick={() => handleDeleteUser(user.email)}>Eliminar</Button>
          </li>
        ))}
      </ul>

      {/* Modal para ver detalles del usuario */}
      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Detalles del Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Email: {selectedUser.email}</p>
            <p>Role: {selectedUser.role}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Formulario para editar rol del usuario */}
      {selectedUser && (
        <div>
          <h3>Editar Rol del Usuario</h3>
          <form onSubmit={() => handleEditUser(selectedUser.email)}>
            <input
              type="text"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              required
            />
            <Button type="submit">Actualizar Rol</Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
