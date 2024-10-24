import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container, Row, Col, Modal, Spinner } from "react-bootstrap";
import { FaWater, FaLightbulb, FaMoneyCheckAlt } from "react-icons/fa";
import { MdNumbers } from "react-icons/md";
import CardSelector from "../components/servicePayment/CardSelector";
import PaymentSummary from "../components/servicePayment/PaymentSummary";
import { useAuth } from "../auth/authContext";
import { reauthenticateUser, reauthenticateWithGoogle } from "../auth/auth"; // Importa las funciones de reautenticación
import { processPayment } from "../api/servicePaymentApi"; // Importa la función de procesamiento de pago

const ServicePaymentForm = () => {
  const [selectedService, setSelectedService] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(""); // Estado para el número de referencia
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados para la reautenticación
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState(null);

  const { currentUser } = useAuth();

  // Funciones para manejar cambios en los inputs
  const handleServiceChange = (e) => setSelectedService(e.target.value);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(sanitizedValue) || sanitizedValue === '') {
      setPaymentAmount(sanitizedValue);
    }
  };

  const handleReferenceChange = (e) => setReferenceNumber(e.target.value);

  // Estado para verificar si el usuario tiene fondos suficientes
  const [hasSufficientFunds, setHasSufficientFunds] = useState(true);

  // Efecto para verificar fondos suficientes cuando cambian el monto o la tarjeta seleccionada
  useEffect(() => {
    if (selectedCard && paymentAmount) {
      const parsedAmount = parseFloat(paymentAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setHasSufficientFunds(false);
      } else {
        setHasSufficientFunds(selectedCard.balance >= parsedAmount);
      }
    } else {
      setHasSufficientFunds(true);
    }
  }, [selectedCard, paymentAmount]);

  // Función para manejar la solicitud de reautenticación
  const handleRequestReauth = (e) => {
    e.preventDefault();
    setShowReauthModal(true);
  };

  // Función para manejar la confirmación de reautenticación y procesar el pago
  const handleConfirmReauth = async () => {
    setReauthError(null);
    try {
      // Determinar el método de inicio de sesión
      const providerData = currentUser.providerData;
      const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');

      if (isGoogleUser) {
        // Reautenticación con Google
        const reauthResult = await reauthenticateWithGoogle();

        if (reauthResult.success) {
          setShowReauthModal(false);
          await handleProcessPayment();
        } else {
          setReauthError(reauthResult.message);
        }
      } else {
        // Reautenticación con correo y contraseña
        if (!reauthPassword) {
          setReauthError('Por favor, ingresa tu contraseña actual.');
          return;
        }

        const reauthResult = await reauthenticateUser(reauthPassword);

        if (reauthResult.success) {
          setShowReauthModal(false);
          await handleProcessPayment();
        } else {
          setReauthError(reauthResult.message);
        }
      }
    } catch (error) {
      setReauthError(error.message || 'Error en la reautenticación.');
    }
  };

  // Función para procesar el pago después de la reautenticación
  const handleProcessPayment = async () => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await processPayment(
        selectedService,
        paymentAmount,
        referenceNumber,
        selectedCard,
        currentUser
      );

      setSuccess(true);

      // Limpiar formulario después del éxito
      setSelectedService("");
      setPaymentAmount("");
      setReferenceNumber("");
      setSelectedCard(null);
    } catch (err) {
      setError(err.message || "Hubo un error al procesar el pago.");
    }

    setLoading(false);
  };

  // Variable para verificar si el formulario está completo y válido
  const isFormComplete = selectedService && paymentAmount > 0 && referenceNumber && selectedCard && hasSufficientFunds;

  return (
    <Container className="my-3 w-100">
      <h2>Pago de Servicios</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Pago realizado con éxito</Alert>}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      <Row>
        {/* Columna izquierda: Seleccionar servicio, monto y tarjeta */}
        <Col md={6}>
          <Form onSubmit={handleRequestReauth}>
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
                <option value="gas">
                  <FaMoneyCheckAlt /> Gas
                </option>
                {/* Añade más servicios según sea necesario */}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="referenceInput" className="mt-3">
              <Form.Label>
                <MdNumbers /> Número de Referencia
              </Form.Label>
              <Form.Control
                type="text"
                value={referenceNumber}
                onChange={handleReferenceChange}
                placeholder="Ingresa el número de referencia"
                required
              />
            </Form.Group>

            <Form.Group controlId="amountInput" className="mt-3">
              <Form.Label>
                <FaMoneyCheckAlt /> Monto a Pagar
              </Form.Label>
              <Form.Control
                type="text"
                value={paymentAmount}
                onChange={handleAmountChange}
                placeholder="Ingresa el monto a pagar"
                required
              />
            </Form.Group>

            <CardSelector selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
          </Form>
        </Col>

        {/* Columna derecha: Resumen de pago */}
        <Col md={6}>
          <PaymentSummary
            service={selectedService}
            amount={paymentAmount}
            card={selectedCard}
            referenceNumber={referenceNumber}
          />

          {!hasSufficientFunds && (
            <Alert variant="warning" className="mt-3">
              Saldo insuficiente en la tarjeta seleccionada.
            </Alert>
          )}

          {/* Botón "Realizar Pago" oculto hasta que el formulario esté completo */}
          {isFormComplete && (
            <Button
              variant="primary"
              onClick={handleRequestReauth}
              disabled={loading}
              className="mt-4 w-100"
            >
              {loading ? "Procesando..." : <> <FaMoneyCheckAlt /> Realizar Pago</>}
            </Button>
          )}
        </Col>
      </Row>

      {/* Modal para reautenticación */}
      <Modal show={showReauthModal} onHide={() => setShowReauthModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reautenticación Requerida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Determinar el método de autenticación */}
          {currentUser.providerData.some(provider => provider.providerId === 'google.com') ? (
            <div>
              <p>Para continuar, por favor reautentícate usando Google.</p>
              {reauthError && <Alert variant="danger">{reauthError}</Alert>}
            </div>
          ) : (
            <Form>
              <Form.Group controlId="reauthPassword">
                <Form.Label>Contraseña Actual</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  required
                />
              </Form.Group>
              {reauthError && <Alert variant="danger" className="mt-3">{reauthError}</Alert>}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReauthModal(false)}>
            Cancelar
          </Button>
          {currentUser.providerData.some(provider => provider.providerId === 'google.com') ? (
            <Button variant="danger" onClick={handleConfirmReauth}>
              Reautenticarse con Google
            </Button>
          ) : (
            <Button variant="primary" onClick={handleConfirmReauth} disabled={!reauthPassword}>
              Reautenticar y Realizar Pago
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ServicePaymentForm;
