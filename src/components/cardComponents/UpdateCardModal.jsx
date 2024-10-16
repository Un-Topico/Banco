import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { reauthenticateUser, reauthenticateWithGoogle } from "../../auth/auth"; // Importar reautenticación
import { updateCreditCard, validateLuhn } from "../../api/updateCardApi"; // Importar las funciones de la API

const UpdateCardModal = ({ show, handleClose, cardData, onCardUpdated }) => {
  const auth = getAuth();
  const [cardNumber, setCardNumber] = useState(cardData.cardNumber || "");
  const [expiryDate, setExpiryDate] = useState(cardData.expiryDate || "");
  const [cvv, setCvv] = useState(cardData.cvv || "");
  const [cardHolderName, setCardHolderName] = useState(cardData.cardHolderName || "");
  const [cardType, setCardType] = useState(cardData.cardType || "");
  const [accountType, setAccountType] = useState(cardData.accountType || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setCardNumber(cardData.cardNumber || "");
    setExpiryDate(cardData.expiryDate || "");
    setCvv(cardData.cvv || "");
    setCardHolderName(cardData.cardHolderName || "");
    setCardType(cardData.cardType || "");
    setAccountType(cardData.accountType || "");
    setPassword(""); // Limpiar la contraseña cuando se cambia la tarjeta
    setError(null); // Limpiar errores anteriores
  }, [cardData]);

  useEffect(() => {
    const cardNumberDigits = cardNumber.replace(/\s/g, "");
    const isCardNumberValid = cardNumberDigits.length >= 16 && validateLuhn(cardNumberDigits);
    const isCvvValid = cvv.length >= 3;
    const isExpiryDateValid = /^\d{2}\/\d{2}$/.test(expiryDate);

    if (
      cardHolderName &&
      isCardNumberValid &&
      isCvvValid &&
      isExpiryDateValid &&
      accountType
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [cardNumber, expiryDate, cvv, cardHolderName, accountType]);

  const detectCardType = (number) => {
    if (!number) {
      setCardType("");
      return;
    }
    const firstDigit = parseInt(number[0], 10);
    if (firstDigit >= 1 && firstDigit <= 4) {
      setCardType("Visa");
    } else if (firstDigit >= 5 && firstDigit <= 8) {
      setCardType("MasterCard");
    } else if (firstDigit === 0 || firstDigit === 9) {
      setCardType("American Express");
    } else {
      setCardType("");
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedNumber = e.target.value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
    setCardNumber(formattedNumber);
    detectCardType(formattedNumber.replace(/\s/g, ""));
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    const cardNumberDigits = cardNumber.replace(/\s/g, "");

    // Validaciones adicionales en el frontend
    if (cardNumberDigits.length < 16) {
      setError("El número de tarjeta debe tener al menos 16 dígitos.");
      return;
    }

    if (!validateLuhn(cardNumberDigits)) {
      setError("El número de tarjeta no es válido según el algoritmo de Luhn.");
      return;
    }

    if (cvv.length < 3) {
      setError("El CVV debe tener al menos 3 dígitos.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError("La fecha de expiración debe tener el formato MM/AA.");
      return;
    }

    if (!["Nomina", "Ahorro", "Corriente"].includes(accountType)) {
      setError("Selecciona un tipo de cuenta válido.");
      return;
    }

    // Reautenticación antes de actualizar la tarjeta
    let result;
    if (auth.currentUser.providerData[0].providerId === "password") {
      result = await reauthenticateUser(password);
    } else {
      result = await reauthenticateWithGoogle();
    }

    if (!result.success) {
      setError("Error en la autenticación. Por favor, verifica tu información.");
      return;
    }

    try {
      // Actualizar los datos de la tarjeta en Firestore
      await updateCreditCard(cardData.cardId, {
        cardNumber: cardNumberDigits,
        expiryDate: expiryDate,
        cardHolderName: cardHolderName,
        cardType: cardType,
        accountType: accountType,
      });

      alert("Tarjeta actualizada correctamente");
      onCardUpdated(); // Notificar que la tarjeta ha sido actualizada
      handleClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al actualizar la tarjeta:", error);
      setError("Hubo un error al actualizar la tarjeta. Inténtalo de nuevo.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Actualizar Tarjeta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateCard}>
          <Form.Group as={Row} controlId="cardHolderName" className="mb-3">
            <Form.Label column sm={4}>
              Nombre en la Tarjeta
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                required
                maxLength={80}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="cardNumber" className="mb-3">
            <Form.Label column sm={4}>
              Número de Tarjeta
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                required
              />
              {cardType && <small>Tipo de tarjeta: {cardType}</small>}
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="accountType" className="mb-3">
            <Form.Label column sm={4}>
              Tipo de Cuenta
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                as="select"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              >
                <option value="">Seleccione el tipo de cuenta</option>
                <option value="Nomina">Nómina</option>
                <option value="Ahorro">Ahorro</option>
                <option value="Corriente">Corriente</option>
              </Form.Control>
            </Col>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="expiryDate">
                <Form.Label>Fecha de Expiración</Form.Label>
                <Form.Control
                  type="text"
                  value={expiryDate}
                  placeholder="MM/AA"
                  maxLength="5"
                  onChange={(e) =>
                    setExpiryDate(
                      e.target.value
                        .replace(/[^0-9/]/g, "")
                        .replace(/(\d{2})(\d{1,2})/, "$1/$2")
                    )
                  }
                  required
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="cvv">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  maxLength="4"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {auth.currentUser.providerData[0].providerId === "password" && (
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mt-4">
            <Col sm={{ span: 8, offset: 4 }} className="text-end">
              <Button
                variant="primary"
                type="submit"
                disabled={isButtonDisabled}
              >
                Actualizar Tarjeta
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateCardModal;
