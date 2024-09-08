import React from "react";
import { Card, Button } from "react-bootstrap";
import { downloadPDF } from "../utils/downloadPDF";

export const AccountInfo = ({ accountData, selectedCard, transactions }) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Información de la Cuenta</Card.Title>
        <Card.Text>
          <p><strong>Tipo de cuenta:</strong> {accountData.accountType}</p>
          {selectedCard && (
            <>
              <p><strong>CLABE:</strong> {selectedCard.clabeNumber}</p>
              <p><strong>Saldo:</strong> ${selectedCard.balance} MXN</p>
            </>
          )}
        </Card.Text>
        {selectedCard && (
          <Button
            variant="primary"
            onClick={() => downloadPDF(accountData, transactions, selectedCard)}
          >
            Descargar Estado de Cuenta
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};
