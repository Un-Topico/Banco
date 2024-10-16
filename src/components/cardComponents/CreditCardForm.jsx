import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";
import { generateClabeNumber, isCardNumberExists, saveCreditCard } from "../../api/creditCardApi"; 
import { useAuth } from "../../auth/authContext";

export const CreditCardForm = ({ onCardSaved }) => {
  const { currentUser } = useAuth(); // Usa el hook de autenticación
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("");
  const [accountType, setAccountType] = useState(""); // Tipo de cuenta
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Función para validar el número de tarjeta usando el algoritmo de Luhn
  const validateLuhn = (number) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

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
    detectCardType(formattedNumber.replace(/\s/g, "")); // Detectar tipo de tarjeta
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      console.error("No hay usuario autenticado.");
      return;
    }

    const cardNumberDigits = cardNumber.replace(/\s/g, "");

    // Validaciones adicionales
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

    try {
      // Validar si el número de tarjeta ya existe
      const cardExists = await isCardNumberExists(cardNumberDigits);
      if (cardExists) {
        setError("El número de tarjeta ya ha sido registrado. Intenta con otro.");
        return;
      }

      // Generar datos de la tarjeta
      const cardId = `card_${currentUser.uid}_${Date.now()}`;
      const clabeNumber = generateClabeNumber();

      const cardData = {
        cardId: cardId,
        cardNumber: cardNumberDigits,
        expiryDate: expiryDate,
        cvv: cvv,
        balance: 100,
        cardHolderName: cardHolderName,
        ownerId: currentUser.uid, // ID del usuario
        createdAt: new Date(),
        updatedAt: new Date(),
        cardType: cardType,
        clabeNumber: clabeNumber,
        accountType: accountType,
      };

      // Guardar la tarjeta en Firestore
      await saveCreditCard(cardData);

      setIsCardSaved(true);
      setIsButtonDisabled(true);
      onCardSaved(true);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
      setError("Hubo un error al guardar la tarjeta. Inténtalo de nuevo.");
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} controlId="cardHolderName" className="mb-3">
          <Form.Label column sm={4}>
            Nombre en la Tarjeta
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              placeholder="Ej: Juan Perez"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
              maxLength={80}
              disabled={isCardSaved}
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
              placeholder="0000 0000 0000 0000"
              maxLength="19"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
              disabled={isCardSaved}
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
              disabled={isCardSaved}
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
                placeholder="MM/AA"
                maxLength="5"
                value={expiryDate}
                onChange={(e) =>
                  setExpiryDate(
                    e.target.value
                      .replace(/[^0-9/]/g, "")
                      .replace(/(\d{2})(\d{1,2})/, "$1/$2")
                  )
                }
                required
                disabled={isCardSaved}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group controlId="cvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="password"
                placeholder="123"
                maxLength="4"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                required
                disabled={isCardSaved}
              />
            </Form.Group>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        <Row className="mt-4">
          <Col sm={{ span: 8, offset: 4 }} className="text-end">
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              disabled={isButtonDisabled || isCardSaved}
            >
              {isCardSaved ? "Tarjeta Guardada" : "Guardar Tarjeta"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};
