import React, { useState, useEffect } from "react";
import { Card as BootstrapCard, Form } from "react-bootstrap";
import { useAuth } from "../../auth/authContext";
import { FaCreditCard } from "react-icons/fa"; // Icono de tarjeta
import { fetchUserCards } from "../../api/cardSelectorApi"; // Importamos la función desde la API

const CardSelector = ({ selectedCard, setSelectedCard }) => {
  const { currentUser } = useAuth();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const loadCards = async () => {
      if (currentUser) {
        try {
          const userCards = await fetchUserCards(currentUser.uid);
          setCards(userCards);
        } catch (error) {
          console.error("Error al obtener las tarjetas del usuario:", error);
        }
      }
    };

    loadCards();
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
          style={{ cursor: "pointer" }}
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
