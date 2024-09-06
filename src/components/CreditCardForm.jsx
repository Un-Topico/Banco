import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

export const CreditCardForm = ({ onCardSaved }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Habilita el botón si todos los campos están completos
    if (cardNumber && expiryDate && cvv && cardHolderName) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [cardNumber, expiryDate, cvv, cardHolderName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    try {
      const cardId = `card_${user.uid}_${Date.now()}`;
      
      const cardData = {
        cardId: cardId,
        cardNumber: cardNumber.replace(/\s/g, ''), // Quitar espacios
        expiryDate: expiryDate,
        cvv: cvv,
        cardHolderName: cardHolderName,
        ownerId: user.uid, // ID del usuario
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cardsCollection = collection(db, 'cards');
      const cardDocRef = doc(cardsCollection, cardId);

      await setDoc(cardDocRef, cardData);

      // Si todo sale bien
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
              disabled={isCardSaved} // Deshabilitar si la tarjeta está guardada
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
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
              required
              disabled={isCardSaved} // Deshabilitar si la tarjeta está guardada
            />
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
                onChange={(e) => setExpiryDate(e.target.value.replace(/[^0-9\/]/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2'))}
                required
                disabled={isCardSaved} // Deshabilitar si la tarjeta está guardada
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
                disabled={isCardSaved} // Deshabilitar si la tarjeta está guardada
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" className="mt-3" disabled={isButtonDisabled || isCardSaved}>
          {isCardSaved ? 'Tarjeta Guardada' : 'Guardar Tarjeta'}
        </Button>
      </Form>
    </Card>
  );
};
