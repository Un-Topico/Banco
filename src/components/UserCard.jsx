import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../auth/authContex';
import { app } from '../firebaseConfig';
import CardComponent from './Card';
import { Container, Row, Alert } from 'react-bootstrap';

const UserCards = ({ onSelectCard }) => {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null); // Estado para la tarjeta activa
  const { currentUser } = useAuth();
  const db = getFirestore(app);

  useEffect(() => {
    const q = query(
      collection(db, 'cards'),
      where('ownerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cardsData = [];
        querySnapshot.forEach((doc) => {
          cardsData.push({ ...doc.data(), id: doc.id });
        });
        setCards(cardsData);
        setError(null);
      },
      (error) => {
        console.error('Error al obtener las tarjetas:', error);
        setError('Hubo un error al obtener las tarjetas.');
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid, db]);

  const handleCardClick = (card) => {
    setActiveCard(card);
    if (onSelectCard) {
      onSelectCard(card);
    }
  };

  return (
    <Container className="text-center mt-5">
      <h2>Mis Tarjetas</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {cards.length === 0 ? (
        <p>No tienes tarjetas agregadas.</p>
      ) : (
        <Row>
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onClick={handleCardClick}
              isActive={activeCard === card} // Pasa la tarjeta activa a CardComponent
            />
          ))}
        </Row>
      )}
    </Container>
  );
};

export default UserCards;
