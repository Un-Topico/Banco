import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { TransactionsForm } from "./TransactionForm";
import { TransactionHistory } from './TransactionHistory';
import { useAuth } from "../auth/authContext";
import { AccountInfo } from "./AccountInfo";

export const TransactionSection = ({ selectedCard, updateCardBalance, accountData, transactions, totalBalance, handleCardDelete }) => {
  const { currentUser } = useAuth(); // Obtener currentUser del contexto

  return (
    <div>
      <Row>
        <Col md={7} className="mb-4">
          <Card>
            <Card.Body>
            {accountData && (
                <AccountInfo
                  accountData={accountData}
                  selectedCard={selectedCard}
                  transactions={transactions}
                  totalBalance={totalBalance}  // Pasamos el balance total al componente AccountInfo
                  handleCardDelete={handleCardDelete}
                />
              )}

             
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} className="mb-4">
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
      </Row>
      <Row>
        <Col md={12} className="mb-4">
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
    </div>
  );
};
