import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Transactions } from "../components/Transactions";

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const db = getFirestore(app);
      const accountsCollection = collection(db, "accounts");
      const q = query(accountsCollection, where("ownerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        navigate('/crear-cuenta');
      } else {
        const accountInfo = querySnapshot.docs[0].data(); // Suponiendo que solo hay una cuenta por usuario
        setAccountData(accountInfo);
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [currentUser, navigate]);

  // Esta función se pasará como prop para actualizar el balance
  const updateBalance = (newBalance) => {
    setAccountData((prevState) => ({
      ...prevState,
      balance: newBalance,
    }));
  };

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
          <p>Balance: ${accountData.balance}</p>
        </div>
      )}
      <Transactions updateBalance={updateBalance} /> {/* Pasar la función como prop */}
    </div>
  );
};
