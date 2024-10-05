import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { TransactionsForm } from "./TransactionForm";
import { TransactionHistory } from './TransactionHistory';
import { useAuth } from "../../auth/authContext";
import { AccountInfo } from "../userComponents/AccountInfo";
import { Link } from "react-router-dom";
import { FaExchangeAlt, FaIdCard, FaHistory } from "react-icons/fa";

export const TransactionSection = ({ selectedCard, updateCardBalance, accountData, transactions, totalBalance, handleCardDelete }) => {
  const { currentUser } = useAuth(); // Obtener currentUser del contexto

  return (
    <div>
      <Row>
        {/* Primera Columna: AccountInfo y Botón */}
        <Col md={7} className="mb-4">
          <Card className="mb-3">
          <Card.Header><FaIdCard /> Información de la tarjeta </Card.Header>
            <Card.Body>
              {accountData && selectedCard ? (
                <AccountInfo
                  accountData={accountData}
                  selectedCard={selectedCard}
                  transactions={transactions}
                  totalBalance={totalBalance}
                  handleCardDelete={handleCardDelete}
                />
              ):(
                <p>Selecciona una tarjeta para ver la informacion de la tarjeta</p>
              ) }
            </Card.Body>
          </Card>
          {/* Botón para llevar a la seccion de pagos*/}
          <Link to="/pagos">
            <Button variant="primary" className="w-100 mb-3">
              Ir a compras realizadas
            </Button>
          </Link>
        </Col>

        {/* Segunda Columna: TransactionsForm */}
        <Col md={5} className="mb-4">
          <Card>
          <Card.Header><FaExchangeAlt /> Realizar Transacción </Card.Header>
            <Card.Body>
              {selectedCard ? (
                <TransactionsForm
                  selectedCardId={selectedCard.cardId}
                  updateBalance={updateCardBalance}
                  currentUser={currentUser}
                />
              ) : (
                <p>Selecciona una tarjeta para realizar transacciones</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TransactionHistory en la fila completa */}
      <Row>
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Header><FaHistory /> Historial de Transacciones </Card.Header>
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
