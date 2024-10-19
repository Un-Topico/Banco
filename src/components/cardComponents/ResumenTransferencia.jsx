import React from 'react';
import { Card, Col } from 'react-bootstrap';

const ResumenTransferencia = ({ selectedCard, recipientInfo, amount }) => {
  if (!selectedCard || !amount || !recipientInfo) return null; // No renderiza nada si falta información

  const parsedAmount = parseFloat(amount);
  const newBalance = selectedCard.balance - parsedAmount;

  return (
    <Col md={12} className="mb-4">
      <Card>
        <Card.Body>
          <Card.Title>Resumen de la Transferencia</Card.Title>
          <Card.Text>
            <strong>Tarjeta Seleccionada:</strong> {selectedCard.cardNumber}
          </Card.Text>
          <Card.Text>
            <strong>Destinatario:</strong> {recipientInfo}
          </Card.Text>
          <Card.Text>
            <strong>Monto a Transferir:</strong> $ {parsedAmount.toFixed(2)}
          </Card.Text>
          <Card.Text>
            <strong>Saldo Total Después de la Transferencia:</strong> $ {newBalance.toFixed(2)}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ResumenTransferencia;
