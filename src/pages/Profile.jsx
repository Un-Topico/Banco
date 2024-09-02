import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Transactions } from "../components/Transactions";
import { Chat } from "../components/Chat";
import { SoporteChat } from "../components/SoporteChat";
import { TransactionHistory } from "../components/TransactionHistory";

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const db = getFirestore(app);

      // Verificar rol del usuario
      const rolesCollection = collection(db, "roles");
      const q = query(rolesCollection, where("email", "==", currentUser.email));
      const rolesSnapshot = await getDocs(q);

      if (!rolesSnapshot.empty) {
        const userRoleData = rolesSnapshot.docs[0].data();
        setUserRole(userRoleData.role);
      }

      // Obtener datos de la cuenta
      const accountsCollection = collection(db, "accounts");
      const q2 = query(accountsCollection, where("ownerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q2);

      if (querySnapshot.empty) {
        navigate('/crear-cuenta');
      } else {
        const accountInfo = querySnapshot.docs[0].data(); // Suponiendo que solo hay una cuenta por usuario
        setAccountData(accountInfo);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Mostrar interfaz basada en el rol del usuario
  return (
    <div className="container text-center">
      <h2>Perfil</h2>
      <FaUserCircle size={50} />       
      <p>Bienvenido, {currentUser.displayName}</p>
      <p>{currentUser.email}</p>
      {accountData && (
        <div>
          <p>Tipo de cuenta: {accountData.accountType}</p>
          <p>Balance: ${accountData.balance}</p>
        </div>
      )}
      <Transactions updateBalance={(newBalance) => setAccountData(prevState => ({ ...prevState, balance: newBalance }))} />
      <TransactionHistory/>
      <div className="chat-section">
        <h3>Chat con el Soporte</h3>
        {userRole === 'soporte' ? <SoporteChat /> : <Chat />}
      </div>
    </div>
  );
};
