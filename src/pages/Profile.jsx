import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/authContex";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { UserProfile } from "../components/UserProfile";
import { AccountInfo } from "../components/AccountInfo";
import { TransactionSection } from "../components/TransactionSection";
import { RealTimeChat } from "../components/RealTimeChat";
import UserCards from "../components/UserCard"; // Importa UserCards aquí
import { Container, Spinner, Button } from "react-bootstrap"; // Importa Button aquí

export const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

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

        // Fetch transactions if a card is selected
        if (selectedCard) {
          const transactionsRef = collection(db, "transactions");
          const transactionsQuery = query(transactionsRef, where("card_id", "==", `${selectedCard.cardId}`));
          const transactionsSnapshot = await getDocs(transactionsQuery);

          const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());
          transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());
          setTransactions(transactionsData);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUser, navigate, selectedCard]);

  const handleCardSelection = (card) => setSelectedCard(card);
  const handleImageUpdate = (newImageUrl) => setAccountData((prevData) => ({ ...prevData, profileImage: newImageUrl }));
  const updateCardBalance = (newBalance) => setSelectedCard((prevCard) => ({ ...prevCard, balance: newBalance }));

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
      />
      {accountData && (
        <AccountInfo
          accountData={accountData}
          selectedCard={selectedCard}
          transactions={transactions}
        />
      )}
      <UserCards onSelectCard={handleCardSelection} />
      <TransactionSection
        selectedCard={selectedCard}
        updateCardBalance={updateCardBalance}
      />
      <RealTimeChat userRole={userRole} />
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
