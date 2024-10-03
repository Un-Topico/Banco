import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { TransactionsForm } from "./TransactionForm";
import {TransactionHistory} from './TransactionHistory';
import { useAuth } from "../auth/authContext"; // Asegúrate de importar el hook correcto

export const TransactionSection = ({ selectedCard, updateCardBalance }) => {
  const { currentUser } = useAuth(); // Obtener currentUser del contexto

  return (
    <Row>
      <Col md={6} className="mb-4">
        <Card>
          <Card.Body>
            {selectedCard ? (
              <TransactionsForm
                selectedCardId={selectedCard.cardId}
                updateBalance={updateCardBalance}
                currentUser={currentUser} 
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
