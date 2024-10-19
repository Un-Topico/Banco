import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { subscribeToUserCards } from '../api/profileApi';
import { SelectedCardComponent } from './cardComponents/SelectedCard';
import { TransferForm } from './transactionComponents/TransferForm';
import { useAuth } from '../auth/authContext';
import ResumenTransferencia from './cardComponents/ResumenTransferencia';

export const Transferir = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState('');
  const [amount, setAmount] = useState('');
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

    if (currentUser) {
      fetchUserCards();
    }
  }, [currentUser]);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  // Función para manejar los cambios en el formulario
  const handleFormChange = (data) => {
    setRecipientInfo(data.recipientInfo);
    setAmount(data.amount);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Realizar una Transferencia</h1>

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
        <>
          <TransferForm selectedCard={selectedCard} onFormChange={handleFormChange} />
          {/* Mostrar ResumenTransferencia solo si se han ingresado el destinatario y el monto */}
          {recipientInfo && amount && (
            <ResumenTransferencia
              selectedCard={selectedCard}
              recipientInfo={recipientInfo}
              amount={amount}
            />
          )}
        </>
      ) : (
        <Alert variant="info">Por favor, selecciona una tarjeta para continuar.</Alert>
      )}
    </Container>
  );
};
