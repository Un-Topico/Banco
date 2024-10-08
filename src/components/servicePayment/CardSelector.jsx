import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../auth/authContext";
import { Card as BootstrapCard, Form } from "react-bootstrap";
import { app } from "../../firebaseConfig";
import { FaCreditCard } from "react-icons/fa"; // Icono de tarjeta

const CardSelector = ({ selectedCard, setSelectedCard }) => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchCards = async () => {
      const db = getFirestore(app);
      const cardsCollection = collection(db, "cards");
      const q = query(cardsCollection, where("ownerId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      // Solo obtener los campos necesarios
      const userCards = querySnapshot.docs.map((doc) => ({
        cardNumber: doc.data().cardNumber,
        balance: doc.data().balance,
        cardId: doc.id, // Necesitamos el ID de la tarjeta
      }));
      setCards(userCards);
    };

    fetchCards();
  }, [currentUser]);

  return (
    <Form.Group controlId="cardSelect" className="mt-3">
      <Form.Label>
        <FaCreditCard /> Selecciona la Tarjeta
      </Form.Label>
      {cards.map((card) => (
        <BootstrapCard
          key={card.cardId}
          className={`mb-2 ${selectedCard?.cardId === card.cardId ? "border-primary" : ""}`}
          onClick={() => setSelectedCard(card)}
          style={{"cursor": "pointer"}}
        >
          <BootstrapCard.Body>
            <BootstrapCard.Title>{card.cardNumber}</BootstrapCard.Title>
            <BootstrapCard.Text>Saldo: ${card.balance} MXN</BootstrapCard.Text>
          </BootstrapCard.Body>
        </BootstrapCard>
      ))}
    </Form.Group>
  );
};

export default CardSelector;
