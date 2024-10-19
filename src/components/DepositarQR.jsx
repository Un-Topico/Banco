import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { subscribeToUserCards } from '../api/profileApi';
import { SelectedCardComponent } from './cardComponents/SelectedCard';
import { QrDepositForm } from './transactionComponents/QrDepositForm';
import { useAuth } from '../auth/authContext';

export const DepositarQR = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCards = () => {
      try {
        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ cards }) => {
          setCards(cards);
          setError(null);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error al obtener las tarjetas del usuario:", error);
        setError("Hubo un error al cargar las tarjetas del usuario.");
      }
    };

    if (currentUser) {
      fetchUserCards();
    }
  }, [currentUser]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Depositar Fondos</h1>

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
                isSelected={selectedCard && selectedCard.id === card.id}
              />
            </Col>
          ))
        )}
      </Row>

      {selectedCard ? (
        <QrDepositForm selectedCardId={selectedCard.cardId} />
      ) : (
        <Alert variant="info">Por favor, selecciona una tarjeta para continuar.</Alert>
      )}
    </Container>
  );
};
