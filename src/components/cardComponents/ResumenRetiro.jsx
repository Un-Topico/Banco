import React from 'react';
import { Card, Col } from 'react-bootstrap';

const ResumenRetiro = ({ selectedCard, depositAmount }) => {
  if (!selectedCard) return null; // No renderiza nada si no hay tarjeta seleccionada

  const totalBalance = selectedCard.balance - depositAmount; // Calculamos el nuevo saldo después del retiro

  return (
    <Col md={12} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Resumen del Retiro</Card.Title>
          <Card.Text>
            <strong>Tarjeta Seleccionada:</strong> {selectedCard.cardNumber}
          </Card.Text>
          <Card.Text>
            <strong>Monto Retirado:</strong> $ {depositAmount}
          </Card.Text>
          <Card.Text>
            <strong>Saldo Total Después del Retiro:</strong> $ {totalBalance.toFixed(2)}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ResumenRetiro;
