import React from 'react';
import { Card, Col } from 'react-bootstrap';

const DepositSummary = ({ selectedCard, depositAmount }) => {
  if (!selectedCard) return null; // No renderiza nada si no hay tarjeta seleccionada

  const totalBalance = selectedCard.balance + depositAmount; // Calculamos el nuevo saldo

  return (
    <Col md={12} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Resumen del Depósito</Card.Title>
          <Card.Text>
            <strong>Tarjeta Seleccionada:</strong> {selectedCard.cardNumber}
          </Card.Text>
          <Card.Text>
            <strong>Monto del Depósito:</strong> $ {depositAmount}
          </Card.Text>
          <Card.Text>
            <strong>Saldo Total Después del Depósito:</strong> $ {totalBalance.toFixed(2)}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default DepositSummary;
