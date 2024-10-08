import React, { useState } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap"; // Añadir Row y Col para el layout
import { getFirestore, collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { FaWater, FaLightbulb, FaMoneyCheckAlt } from "react-icons/fa";
import { MdNumbers } from "react-icons/md";
import CardSelector from "../components/servicePayment/CardSelector";
import PaymentSummary from "../components/servicePayment/PaymentSummary";

const ServicePaymentForm = () => {
  const [selectedService, setSelectedService] = useState("");
  const [paymentAmount, setPaymentAmount] = useState();
  const [referenceNumber, setReferenceNumber] = useState(""); // Estado para el número de referencia
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleServiceChange = (e) => setSelectedService(e.target.value);
  const handleAmountChange = (e) => setPaymentAmount(Number(e.target.value));
  const handleReferenceChange = (e) => setReferenceNumber(e.target.value); // Manejar cambios del número de referencia

  const handlePayment = async () => {
    setError("");
    if (!selectedService || !paymentAmount || !referenceNumber || !selectedCard) {
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
        reference_number: referenceNumber, // Número de referencia
        status: "pagado",
        transaction_type: "pagoServicio",
        category: "servicio",
        transaction_id: `${selectedService}-${new Date().getTime()}`,
        transaction_date: new Date(),
        card_id: selectedCard.cardId,
        service_type: selectedService,
      };

      await addDoc(transactionsCollection, transactionData);
      setSuccess(true);
      // Limpiar formulario después del éxito
      setSelectedService("");
      setPaymentAmount(0);
      setReferenceNumber(""); // Limpiar el número de referencia
      setSelectedCard(null);
    } catch (err) {
      setError("Hubo un error al procesar el pago");
    }
    setLoading(false);
  };

  const isFormComplete = selectedService && paymentAmount > 0 && referenceNumber && selectedCard;

  return (
    <Container className="my-3">
      <h2>Pago de Servicios</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Pago realizado con éxito</Alert>}

      <Row>
        {/* Columna izquierda: Seleccionar servicio, monto y tarjeta */}
        <Col md={6}>
          <Form.Group controlId="serviceSelect">
            <Form.Label>
              <FaLightbulb /> Selecciona el Servicio
            </Form.Label>
            <Form.Control as="select" value={selectedService} onChange={handleServiceChange}>
              <option value="">Seleccionar...</option>
              <option value="agua">
                <FaWater /> Agua
              </option>
              <option value="luz">
                <FaLightbulb /> Luz
              </option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="referenceInput" className="mt-3">
            <Form.Label><MdNumbers /> Número de Referencia</Form.Label>
            <Form.Control
              type="text"
              value={referenceNumber}
              onChange={handleReferenceChange}
              placeholder="Ingresa el número de referencia"
            />
          </Form.Group>
          <Form.Group controlId="amountInput" className="mt-3">
            <Form.Label>
              <FaMoneyCheckAlt /> Monto a Pagar
            </Form.Label>
            <Form.Control type="number" value={paymentAmount} onChange={handleAmountChange} />
          </Form.Group>

         

          <CardSelector selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        </Col>

        {/* Columna derecha: Resumen de pago y botón */}
        <Col md={6}>
          <PaymentSummary service={selectedService} amount={paymentAmount} card={selectedCard} referenceNumber={referenceNumber}/>

          {isFormComplete && (
            <Button
              variant="primary"
              onClick={handlePayment}
              disabled={loading} // Deshabilitar el botón mientras está cargando
              className="mt-4 w-100"
              block
            >
              {loading ? "Procesando..." : <> <FaMoneyCheckAlt /> Realizar Pago</>}
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ServicePaymentForm;
