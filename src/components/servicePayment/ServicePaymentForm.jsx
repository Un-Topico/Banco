import React, { useState } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import { getFirestore, collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import CardSelector from "./CardSelector";
import PaymentSummary from "./PaymentSummary";

const ServicePaymentForm = () => {
  const [selectedService, setSelectedService] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleServiceChange = (e) => setSelectedService(e.target.value);
  const handleAmountChange = (e) => setPaymentAmount(Number(e.target.value));

  const handlePayment = async () => {
    setError("");
    if (!selectedService || !paymentAmount || !selectedCard) {
      setError("Por favor, completa todos los campos");
      return;
    }

    if (selectedCard.balance < paymentAmount) {
      setError("Saldo insuficiente en la tarjeta seleccionada");
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore(app);
      const cardRef = doc(db, "cards", selectedCard.cardId);
      await updateDoc(cardRef, {
        balance: selectedCard.balance - paymentAmount,
      });

      const transactionsCollection = collection(db, "transactions");
      const transactionData = {
        amount: paymentAmount,
        description: `Pago de servicio de ${selectedService}`,
        status: "pagado",
        transaction_type: "pagoServicio",
        category: "servicio",
        transaction_id: `${selectedService}-${new Date().getTime()}`,
        transaction_date: new Date(),
        card_id: selectedCard.cardId,
        service_type: selectedService, // Nueva propiedad que almacena el tipo de servicio
      };
      

      await addDoc(transactionsCollection, transactionData);
      setSuccess(true);
    } catch (err) {
      setError("Hubo un error al procesar el pago");
    }
    setLoading(false);
  };

  return (
    <Container className="my-3">
      <h2>Pago de Servicios</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Pago realizado con éxito</Alert>}

      <Form>
        <Form.Group controlId="serviceSelect">
          <Form.Label>Selecciona el Servicio</Form.Label>
          <Form.Control as="select" value={selectedService} onChange={handleServiceChange}>
            <option value="">Seleccionar...</option>
            <option value="agua">Agua</option>
            <option value="luz">Luz</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="amountInput" className="mt-3">
          <Form.Label>Monto a Pagar</Form.Label>
          <Form.Control type="number" value={paymentAmount} onChange={handleAmountChange} />
        </Form.Group>

        <CardSelector selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        
        <PaymentSummary service={selectedService} amount={paymentAmount} card={selectedCard} />

        <Button variant="primary" onClick={handlePayment} disabled={loading} className="mt-4">
          {loading ? "Procesando..." : "Realizar Pago"}
        </Button>
      </Form>
    </Container>
  );
};

export default ServicePaymentForm;