import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Transactions } from "../components/Transactions";
import { Chat } from "../components/Chat";
import { SoporteChat } from "../components/SoporteChat";
import { TransactionHistory } from "../components/TransactionHistory";
import { downloadPDF } from "../utils/downloadPDF"; 

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]); // Estado para las transacciones

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
        const accountInfo = querySnapshot.docs[0].data();
        setAccountData(accountInfo);

        // Obtener transacciones
        const transactionsRef = collection(db, "transactions");
        const q3 = query(transactionsRef, where("account_id", "==", `account_${currentUser.uid}`));
        const transactionsSnapshot = await getDocs(q3);
        
        const transactionsData = [];
        transactionsSnapshot.forEach((doc) => {
          transactionsData.push(doc.data());
        });

        transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());
        setTransactions(transactionsData);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="container text-center">
      <h2>Perfil</h2>
      <FaUserCircle size={50} />       
      <p>Bienvenido, {currentUser.displayName}</p>
      <p>{currentUser.email}</p>
      {accountData && (
        <div>
          <p>Tipo de cuenta: {accountData.accountType}</p>
          <p>Saldo: ${accountData.balance} MXN</p>
        </div>
      )}
      <button 
        className="btn btn-primary"
        onClick={() => downloadPDF(accountData, currentUser, transactions)}>
        Descargar Estado de Cuenta
      </button>
      <Transactions updateBalance={(newBalance) => setAccountData(prevState => ({ ...prevState, balance: newBalance }))} />
      <TransactionHistory/>
      <div className="chat-section">
        <h3>Chat en Tiempo Real</h3>
        {userRole === 'soporte' ? <SoporteChat /> : <Chat />}
      </div>
      {/* Botón solo para administradores */}
      {userRole === 'admin' && (
        <button 
          className="btn btn-secondary mt-3"
          onClick={() => navigate('/admin/users')}>
          Panel de Administración
        </button>
      )}
    </div>
  );
};
