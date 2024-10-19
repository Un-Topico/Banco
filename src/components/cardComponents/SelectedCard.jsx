import React from 'react';
import { Card } from 'react-bootstrap';

export const SelectedCardComponent = ({ card, onClick, isActive }) => {
  return (
    <Card
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className={isActive ? 'bg-primary text-white' : 'bg-light'} // Cambia el color si está activa
    >
      <Card.Body>
        <Card.Title>Tarjeta {card.cardNumber}</Card.Title>
        <Card.Text>
          <strong>Saldo:</strong> ${card.balance}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
