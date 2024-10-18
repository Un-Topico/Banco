import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../auth/authContext';
import { subscribeToUserCards, getUserAccount } from '../api/profileApi';
import CardComponent from '../components/cardComponents/Card';
import { AccountInfo } from '../components/userComponents/AccountInfo';
import { TransactionsForm } from '../components/transactionComponents/TransactionForm';

export const Operaciones = () => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener datos de la cuenta del usuario
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

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <Container className="text-center mt-4 mb-4">
      <h1>Operaciones</h1>

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
        <>
          <AccountInfo 
            accountData={accountData} 
            selectedCard={selectedCard} 
            transactions={[]} // Puedes pasar las transacciones si es necesario
            onCardDelete={() => setSelectedCard(null)} 
          />
          <TransactionsForm 
            currentUser={currentUser} 
            selectedCardId={selectedCard.cardId} 
            updateBalance={(newBalance = 100) => console.log(newBalance)} // Valor por defecto de 100
          />
        </>
      )}
    </Container>
  );
};
