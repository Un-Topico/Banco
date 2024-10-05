import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';

export const CreditCardForm = ({ onCardSaved }) => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardType, setCardType] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
    }
  }, [auth.currentUser, navigate]);

  useEffect(() => {
    if (cardNumber && expiryDate && cvv && cardHolderName) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [cardNumber, expiryDate, cvv, cardHolderName]);

  const generateClabeNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-10); // Últimos 10 dígitos del timestamp
    const randomNumbers = Math.floor(1000000000 + Math.random() * 9000000000); // Generar 9 dígitos aleatorios
    return `${timestamp}${randomNumbers}`;
  };

  const detectCardType = (number) => {
    const firstDigit = parseInt(number[0], 10);
    if (firstDigit >= 1 && firstDigit <= 4) {
      setCardType('Visa');
    } else if (firstDigit >= 5 && firstDigit <= 8) {
      setCardType('MasterCard');
    } else if (firstDigit === 0 || firstDigit === 9) {
      setCardType('American Express');
    } else {
      setCardType('');
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedNumber = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formattedNumber);
    detectCardType(formattedNumber.replace(/\s/g, '')); // Detectar tipo de tarjeta
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    // Validar si el número de tarjeta ya existe en la base de datos
    const cardsQuery = query(collection(db, 'cards'), where('cardNumber', '==', cardNumber.replace(/\s/g, '')));
    const querySnapshot = await getDocs(cardsQuery);

    if (!querySnapshot.empty) {
      setError('El número de tarjeta ya ha sido registrado. Intenta con otro.');
      return;
    }

    try {
      const cardId = `card_${user.uid}_${Date.now()}`;
      const clabeNumber = generateClabeNumber(); // Generar número CLABE

      const cardData = {
        cardId: cardId,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate: expiryDate,
        cvv: cvv,
        balance: 100,
        cardHolderName: cardHolderName,
        ownerId: user.uid, // ID del usuario
        createdAt: new Date(),
        updatedAt: new Date(),
        cardType: cardType, // Tipo de tarjeta (Visa, MasterCard, American Express)
        clabeNumber: clabeNumber, // Número CLABE generado
      };

      const cardsCollection = collection(db, 'cards');
      const cardDocRef = doc(cardsCollection, cardId);

      await setDoc(cardDocRef, cardData);

      setIsCardSaved(true);
      setIsButtonDisabled(true);
      onCardSaved(true);
    } catch (error) {
      console.error("Error al guardar la tarjeta:", error);
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="mb-4">Añadir Tarjeta</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} controlId="cardHolderName" className="mb-3">
          <Form.Label column sm={4}>Nombre en la Tarjeta</Form.Label>
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
          <Form.Label column sm={4}>Número de Tarjeta</Form.Label>
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

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="expiryDate">
              <Form.Label>Fecha de Expiración</Form.Label>
              <Form.Control
                type="text"
                placeholder="MM/AA"
                maxLength="5"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value.replace(/[^0-9/]/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2'))}
                required
                disabled={isCardSaved}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group controlId="cvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="text"
                placeholder="123"
                maxLength="4"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                required
                disabled={isCardSaved}
              />
            </Form.Group>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="primary" type="submit" className="mt-3" disabled={isButtonDisabled || isCardSaved}>
          {isCardSaved ? 'Tarjeta Guardada' : 'Guardar Tarjeta'}
        </Button>
      </Form>
    </Card>
  );
};
