import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/authContext';
import { getUserRole, getUserAccount, subscribeToUserCards, getTransactionsByCardId } from '../api/profileApi';
import CardComponent from '../components/cardComponents/Card';
import { AccountInfo } from '../components/userComponents/AccountInfo';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';

// Inicializar Firestore
const db = getFirestore(app);

export const Tarjetas = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener datos de la cuenta
        const account = await getUserAccount(currentUser.uid);
        if (!account) {
          setError("No se encontró la cuenta del usuario.");
          return;
        }
        setAccountData(account);

        // Suscribirse a las tarjetas del usuario
        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ cards }) => {
          setCards(cards);
          setError(null);
        });

        // Cleanup: elimina el listener cuando el componente se desmonte
        return () => unsubscribe();
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        setError("Hubo un error al cargar los datos del usuario.");
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (selectedCard) {
        try {
          const trans = await getTransactionsByCardId(selectedCard.cardId);
          setTransactions(trans);
        } catch (error) {
          console.error("Error al obtener transacciones:", error);
          setError("Hubo un error al cargar las transacciones.");
        }
      }
    };

    fetchTransactions();
  }, [selectedCard]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Mis Tarjetas</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {cards.length === 0 ? (
          <Col>
            <p>No tienes tarjetas agregadas.</p>
          </Col>
        ) : (
          cards.map((card) => (
            <Col md={4} key={card.id} className="mb-4">
              <CardComponent card={card} onClick={() => handleCardSelect(card)} />
            </Col>
          ))
        )}
      </Row>

      {selectedCard && (
        <AccountInfo 
          accountData={accountData} 
          selectedCard={selectedCard} 
          transactions={transactions} 
          onCardDelete={() => setSelectedCard(null)} // Función para actualizar el estado al eliminar
        />
      )}
    </Container>
  );
};
