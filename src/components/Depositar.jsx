import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { subscribeToUserCards } from '../api/profileApi';
import { SelectedCardComponent } from './cardComponents/SelectedCard';
import { DepositForm } from './transactionComponents/DepositForm';
import { useAuth } from '../auth/authContext';
import DepositSummary from './cardComponents/DepositSummary'; // Asegúrate de que la ruta sea correcta

export const Depositar = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0); // Estado para el monto del depósito

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
        setError("Hubo un error al cargar las tarjetas.");
      }
    };

    fetchUserCards();
  }, [currentUser]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  const handleDepositAmountChange = (amount) => {
    setDepositAmount(amount);
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
            <Col md={6} key={card.id} className="mb-4">
              <SelectedCardComponent
                card={card}
                onClick={() => handleCardSelect(card)}
                isActive={selectedCard && selectedCard.id === card.id}
              />
            </Col>
          ))
        )}
      </Row>

      <Row>
        {selectedCard ? (
          <>
            <DepositForm 
              selectedCard={selectedCard} 
              onDepositAmountChange={handleDepositAmountChange} // Pasa la función para cambiar el monto
            />
            {depositAmount > 0 && ( // Mostrar resumen solo si hay un monto ingresado
              <DepositSummary selectedCard={selectedCard} depositAmount={depositAmount} />
            )}
          </>
        ) : (
          <Alert variant="info">Por favor, selecciona una tarjeta para continuar.</Alert>
        )}
      </Row>
    </Container>
  );
};
