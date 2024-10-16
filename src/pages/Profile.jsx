import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { getUserRole, getUserAccount, subscribeToUserCards, getTransactionsByCardId } from "../api/profileApi";
import { UserProfile } from "../components/userComponents/UserProfile";
import { TransactionSection } from "../components/transactionComponents/TransactionSection";
import UserCards from "../components/cardComponents/UserCard";
import DialogFlowChat from "../components/chatComponents/DialogFlowChat";
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

      try {
        // Obtener rol del usuario
        const role = await getUserRole(currentUser.email);
        setUserRole(role);

        // Obtener datos de la cuenta
        const account = await getUserAccount(currentUser.uid);
        if (!account) {
          navigate("/crear-cuenta");
          return;
        }
        setAccountData(account);

        // Suscribirse a las tarjetas del usuario
        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ cards, total }) => {
          setTotalBalance(total);
          // Aquí podrías también manejar las tarjetas si lo necesitas
        });

        // Cleanup: elimina el listener cuando el componente se desmonte
        return () => unsubscribe();
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedCard) {
        try {
          const trans = await getTransactionsByCardId(selectedCard.cardId);
          setTransactions(trans);
        } catch (error) {
          console.error("Error al obtener transacciones:", error);
        }
      }
    };

    fetchTransactions();
  }, [selectedCard]);

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
        totalBalance={totalBalance}  // Pasamos el balance total
      />
      <UserCards onSelectCard={handleCardSelection} />
      <TransactionSection
        selectedCard={selectedCard}
        updateCardBalance={updateCardBalance}
        accountData={accountData}
        transactions={transactions}
        totalBalance={totalBalance}
        handleCardDelete={handleCardDelete} // Pasamos la función correctamente
      />
      <DialogFlowChat/>
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
