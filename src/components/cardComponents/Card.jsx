import React from 'react';
import { Card, Col } from 'react-bootstrap';
const CardComponent = ({ card, onClick, isActive }) => {
  return (
    <Col >
      <Card
        onClick={() => onClick(card)}
        style={{ cursor: 'pointer' }}
        className={isActive ? 'bg-primary text-white' : ''}
      >
          <Card.Body>
          <Card.Title>Tarjeta {card.cardNumber}</Card.Title>
          <Card.Text>
            <strong>Fecha de Expiración:</strong> {card.expiryDate}
            </Card.Text>
          <Card.Text>
            <strong>Tipo:</strong> {card.cardType}
            </Card.Text>
            </Card.Body>
      </Card>
    </Col>
  );
};

export default CardComponent;
