import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const rolesCollection = collection(db, 'roles');
        const snapshot = await getDocs(rolesCollection);
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const rolesCollection = collection(db, 'roles');
      await setDoc(doc(rolesCollection, newUser.email), newUser);
      setUsers(prev => [...prev, newUser]);
      setNewUser({ email: '', role: 'user' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  const handleSubmit=(e)=>{
    e.preventDefault()
    handleEditUser(editingUser)
  }
  const handleEditUser = async (email) => {
    try {
      
      const rolesCollection = collection(db, 'roles');
      await setDoc(doc(rolesCollection, email), { role: editRole }, { merge: true });
      setUsers(prev => prev.map(user => user.email === email ? { ...user, role: editRole } : user));
      setEditingUser(null);
      setEditRole('');
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (email) => {
    try {
      const rolesCollection = collection(db, 'roles');
      await deleteDoc(doc(rolesCollection, email));
      setUsers(prev => prev.filter(user => user.email !== email));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h2>Administrar Usuarios</h2>

      <form onSubmit={handleCreateUser}>
        <h3>Crear Usuario</h3>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={newUser.email}
          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="soporte">Soporte</option>

        </select>
        <button type="submit">Crear Usuario</button>
      </form>

      <h3>Lista de Usuarios</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.email} - {user.role}
            <button onClick={() => { setEditingUser(user.email); setEditRole(user.role); }}>Editar</button>
            <button onClick={() => handleDeleteUser(user.email)}>Eliminar</button>
          </li>
        ))}
      </ul>

      {editingUser && (
        <form onSubmit={ handleSubmit}>
          <h3>Editar Usuario</h3>
          <input
            type="text"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            required
          />
          <button type="submit">Actualizar Rol</button>
        </form>
      )}
    </div>
  );
};

export default AdminUsers;
