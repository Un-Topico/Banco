import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Transactions } from "./Transactions";
import { TransactionHistory } from "./TransactionHistory";

export const TransactionSection = ({ selectedCard, updateCardBalance }) => {
  return (
    <Row>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Body>
            <Card.Title>Transacciones</Card.Title>
            {selectedCard ? (
              <Transactions
                selectedCardId={selectedCard.cardId}
                updateBalance={updateCardBalance}
              />
            ) : (
              <p>Selecciona una tarjeta para ver las transacciones</p>
            )}
          </Card.Body>
        </Card>
      </Col>

      <Col md={6} className="mb-4">
        <Card>
          <Card.Body>
            <Card.Title>Historial de Transacciones</Card.Title>
            {selectedCard ? (
              <TransactionHistory selectedCardId={selectedCard.cardId} />
            ) : (
              <p>Selecciona una tarjeta para ver el historial</p>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};
