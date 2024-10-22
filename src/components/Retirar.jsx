import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { subscribeToUserCards } from '../api/profileApi';
import { SelectedCardComponent } from './cardComponents/SelectedCard';
import { RetirarForm } from './transactionComponents/RetirarForm';
import { useAuth } from '../auth/authContext';
import ResumenRetiro from './cardComponents/ResumenRetiro';

export const Retirar = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0); // Nuevo estado para el monto
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

  // Función para manejar el monto depositado
  const handleDepositAmountChange = (amount) => {
    setDepositAmount(amount);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Realizar un Retiro</h1>

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

      {selectedCard ? (
        <RetirarForm 
          selectedCard={selectedCard} 
          onDepositAmountChange={handleDepositAmountChange} // Pasar el manejador de cambio de monto
        />
      ) : (
        <Alert variant="info">Por favor, selecciona una tarjeta para continuar.</Alert>
      )}

      {/* Mostrar ResumenRetiro solo si se ha ingresado un monto válido */}
      {depositAmount > 0 && selectedCard && (
        <ResumenRetiro 
          selectedCard={selectedCard} 
          depositAmount={depositAmount} 
        />
      )}
    </Container>
  );
};
