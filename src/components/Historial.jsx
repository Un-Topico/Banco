import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import {  subscribeToUserCards } from '../api/profileApi';
import { SelectedCardComponent } from './cardComponents/SelectedCard';
import { TransactionHistory } from '../components/transactionComponents/TransactionHistory';
import { useAuth } from '../auth/authContext';

export const Historial = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
      <h1>Historial de Transacciones</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {cards.length === 0 ? (
          <Col>
            <p>No tienes tarjetas agregadas.</p>
          </Col>
        ) : (
          cards.map((card) => (
            <Col md={4} key={card.id} className="mb-4">
             <SelectedCardComponent
                card={card}
                onClick={() => handleCardSelect(card)}
                isActive={selectedCard && selectedCard.id === card.id}
              />
            </Col>
          ))
        )}
      </Row>

      {selectedCard && (
        <TransactionHistory selectedCardId={selectedCard.cardId} />
      )}
    </Container>
  );
};
