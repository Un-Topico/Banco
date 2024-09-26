import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { UserProfile } from "../components/UserProfile";
import { AccountInfo } from "../components/AccountInfo";
import { TransactionSection } from "../components/TransactionSection";
import UserChat from "../components/UserChat";
import UserCards from "../components/UserCard";
import { Container, Spinner, Button } from "react-bootstrap";

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);  // Estado para el balance total

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const db = getFirestore(app);

      // Fetch user role
      const rolesCollection = collection(db, "roles");
      const roleQuery = query(rolesCollection, where("email", "==", currentUser.email));
      const rolesSnapshot = await getDocs(roleQuery);

      if (!rolesSnapshot.empty) {
        const userRoleData = rolesSnapshot.docs[0].data();
        setUserRole(userRoleData.role);
      }

      // Fetch account data
      const accountsCollection = collection(db, "accounts");
      const accountQuery = query(accountsCollection, where("ownerId", "==", currentUser.uid));
      const accountSnapshot = await getDocs(accountQuery);

      if (accountSnapshot.empty) {
        navigate("/crear-cuenta");
      } else {
        const accountInfo = accountSnapshot.docs[0].data();
        setAccountData(accountInfo);
      }

      // Listener para las tarjetas del usuario
      const cardsCollection = collection(db, "cards");
      const cardsQuery = query(cardsCollection, where("ownerId", "==", currentUser.uid));

      const unsubscribe = onSnapshot(cardsQuery, (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          total += doc.data().balance;  // Sumamos el balance de cada tarjeta
        });

        setTotalBalance(total);  // Establecemos el balance total en tiempo real
      });

      if (selectedCard) {
        const transactionsRef = collection(db, "transactions");
        const transactionsQuery = query(transactionsRef, where("card_id", "==", `${selectedCard.cardId}`));
        const transactionsSnapshot = await getDocs(transactionsQuery);

        const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());
        transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());
        setTransactions(transactionsData);
      }

      setLoading(false);

      // Cleanup: elimina el listener cuando el componente se desmonte
      return () => unsubscribe();
    };

    fetchUserData();
  }, [currentUser, navigate, selectedCard]);

  const handleCardSelection = (card) => setSelectedCard(card);
  const handleImageUpdate = (newImageUrl) => setAccountData((prevData) => ({ ...prevData, profileImage: newImageUrl }));
  const updateCardBalance = (newBalance) => setSelectedCard((prevCard) => ({ ...prevCard, balance: newBalance }));

  const handleCardDelete = () => {
    setSelectedCard(null); // Deselecciona la tarjeta después de eliminarla
  };

  const handleNameUpdate = (newName) => {
    setAccountData((prevData) => ({
      ...prevData,
      name: newName,
    }));
  };

  const handlePhoneUpdate = (newPhone) => {
    setAccountData((prevData) => ({
      ...prevData,
      phoneNumber: newPhone,
    }));
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-3">
      <UserProfile
        accountData={accountData}
        currentUser={currentUser}
        onImageUpdate={handleImageUpdate}
        onNameUpdate={handleNameUpdate}
        onPhoneUpdate={handlePhoneUpdate}
      />
      {accountData && (
        <AccountInfo
          accountData={accountData}
          selectedCard={selectedCard}
          transactions={transactions}
          totalBalance={totalBalance}  // Pasamos el balance total al componente AccountInfo
          onCardDelete={handleCardDelete}
        />
      )}
      <UserCards onSelectCard={handleCardSelection} />
      <TransactionSection
        selectedCard={selectedCard}
        updateCardBalance={updateCardBalance}
      />
      <UserChat />
      {userRole === "admin" && (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate("/admin/users")}
        >
          Panel de Administración
        </Button>
      )}
    </Container>
  );
};
