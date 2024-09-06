import React from 'react';
import { Card, Col } from 'react-bootstrap';

const CardComponent = ({ card }) => {
  return (
    <Col md={4} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Tarjeta {card.card_number}</Card.Title>
          <Card.Text>
            <strong>Tipo:</strong> {card.card_type}
          </Card.Text>
          <Card.Text>
            <strong>Fecha de Expiración:</strong> {card.expiry_date}
          </Card.Text>
          <Card.Text>
            <strong>Saldo:</strong> ${card.balance.toFixed(2)}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default CardComponent;
