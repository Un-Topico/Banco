import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/authContext';
import { getUserAccount, subscribeToUserCards, getTransactionsByCardId } from '../api/profileApi';
import CardComponent from '../components/cardComponents/Card';
import { AccountInfo } from '../components/userComponents/AccountInfo';

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
        const account = await getUserAccount(currentUser.uid);
        if (!account) {
          setError("No se encontró la cuenta del usuario.");
          return;
        }
        setAccountData(account);

        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ cards }) => {
          setCards(cards);
          setError(null);
        });

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
        {/* Tarjetas (máximo 3 por fila) */}
        <Col md={12}>
          <Row>
            {cards.length === 0 ? (
              <Col>
                <p>No tienes tarjetas agregadas.</p>
              </Col>
            ) : (
              cards.map((card) => (
                <Col md={6} key={card.id} className="mb-4">
                  <CardComponent
                    card={card}
                    onClick={() => handleCardSelect(card)}
                    isActive={selectedCard && selectedCard.cardId === card.cardId} // Pasa el estado activo
                  />
                </Col>
              ))
            )}
          </Row>
        </Col>

        {/* Información de la tarjeta seleccionada */}
        <Col md={12}>
          {selectedCard ? (
            <AccountInfo 
              accountData={accountData} 
              selectedCard={selectedCard} 
              transactions={transactions} 
              onCardDelete={() => setSelectedCard(null)} 
            />
          ) : (
            <p>Selecciona una tarjeta para ver más información.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};
