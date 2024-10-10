import React from "react";
import { Card as BootstrapCard } from "react-bootstrap";

const PaymentSummary = ({ service, amount, card, referenceNumber }) => {
  if (!service || !amount || !card) {
    return null;
  }

  return (
    <BootstrapCard className="mt-4">
      <BootstrapCard.Body>
        <BootstrapCard.Title>Resumen del Pago</BootstrapCard.Title>
        <BootstrapCard.Text>
          <strong>Servicio:</strong> {service}
          <br />
          <strong>Número de referencia de pago:</strong> {referenceNumber}
          <br />
          <strong>Monto:</strong> ${amount} MXN
          <br />
          <strong>Tarjeta:</strong> {card.cardNumber}
          <br />
          <strong>Nuevo Saldo:</strong> {card.balance - amount}
        </BootstrapCard.Text>
      </BootstrapCard.Body>
    </BootstrapCard>
  );
};

export default PaymentSummary;