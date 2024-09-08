import React from "react";
import { Card, Button } from "react-bootstrap";
import { downloadPDF } from "../utils/downloadPDF";
import { deleteCard } from "../auth/deleteCard";

export const AccountInfo = ({ accountData, selectedCard, transactions, onCardDelete }) => {
  const handleDeleteCard = async () => {
    if (selectedCard) {
      await deleteCard(selectedCard.cardId); // Llama a la función para eliminar la tarjeta
      onCardDelete(); // Llama a la función para actualizar el estado en el componente padre
    }
  };

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
          <>
            <Button
              variant="primary"
              onClick={() => downloadPDF(accountData, transactions, selectedCard)}
            >
              Descargar Estado de Cuenta
            </Button>
            <Button
              variant="danger"
              className="ms-2"
              onClick={handleDeleteCard}
            >
              Eliminar Tarjeta
            </Button>
          </>
        )}
      </Card.Body>
    </Card>
  );
};
