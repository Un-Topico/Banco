import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { subscribeToUserCards } from '../api/profileApi';
import CardComponent from '../components/cardComponents/Card';
import { RetirarForm } from './transactionComponents/RetirarForm';
import { useAuth } from '../auth/authContext';

export const Retirar = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCards = () => {
      try {
        // Suscribirse a las tarjetas del usuario
        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ cards }) => {
          setCards(cards);
          setError(null);
        });

        // Cleanup: elimina el listener cuando el componente se desmonte
        return () => unsubscribe();
      } catch (error) {
        console.error("Error al obtener las tarjetas del usuario:", error);
        setError("Hubo un error al cargar las tarjetas.");
      }
    };

    fetchUserCards();
  }, [currentUser]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Realizar un Depósito</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {cards.length === 0 ? (
          <Col>
            <p>No tienes tarjetas agregadas.</p>
          </Col>
        ) : (
          cards.map((card) => (
            <Col md={4} key={card.id} className="mb-4">
              <CardComponent
                card={card}
                onClick={() => handleCardSelect(card)}
                isSelected={selectedCard && selectedCard.id === card.id}
              />
            </Col>
          ))
        )}
      </Row>

      {selectedCard ? (
        <RetirarForm selectedCard={selectedCard} />
      ) : (
        <Alert variant="info">Por favor, selecciona una tarjeta para continuar.</Alert>
      )}
    </Container>
  );
};
