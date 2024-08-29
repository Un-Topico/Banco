// CreateAccount.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

export const CreateAccount = () => {
  const [accountType, setAccountType] = useState('Ahorro');
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si hay un usuario autenticado
    const user = auth.currentUser;
    if (!user) {
      navigate('/login'); // Redirige al login si no hay usuario autenticado
    }
  }, [navigate]);

  const createAccount = async (userEmail) => {
    try {
      // identificador único para la cuenta
      const accountId = `account_${Date.now()}`; 

      const accountData = {
        accountId: accountId,
        accountType: accountType,
        balance: 100, // Saldo inicial
        ownerId: userEmail,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const accountsCollection = collection(db, 'accounts');
      const accountDocRef = doc(accountsCollection, accountId);

      await setDoc(accountDocRef, accountData);
      console.log("Cuenta creada con éxito:", accountId);
      navigate('/perfil'); // Redirige al perfil después de crear la cuenta
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    await createAccount(user.email);
  };

  return (
    <div>
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="accountType">Tipo de Cuenta:</label>
          <select
            id="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="Ahorro">Ahorro</option>
            <option value="Corriente">Corriente</option>
          </select>
        </div>
        <button type="submit">Crear Cuenta</button>
      </form>
    </div>
  );
};
