import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { getFirestore, collection, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { reauthenticateUser, reauthenticateWithGoogle } from '../auth/auth'; // Importamos la reautenticación
import { app } from '../firebaseConfig';
import { FaUser, FaCreditCard, FaCalendarAlt, FaLock, FaKey } from 'react-icons/fa'; // Importar iconos

const UpdateCardModal = ({ show, handleClose, cardData, onCardUpdated }) => {
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [cardNumber, setCardNumber] = useState(cardData.cardNumber || '');
  const [expiryDate, setExpiryDate] = useState(cardData.expiryDate || '');
  const [cvv, setCvv] = useState(cardData.cvv || '');
  const [cardHolderName, setCardHolderName] = useState(cardData.cardHolderName || '');
  const [cardType, setCardType] = useState(cardData.cardType || '');
  const [password, setPassword] = useState(''); // Campo para la contraseña
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (cardNumber && expiryDate && cvv && cardHolderName) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [cardNumber, expiryDate, cvv, cardHolderName]);

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
    detectCardType(formattedNumber.replace(/\s/g, ''));
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    // Reautenticación antes de actualizar la tarjeta
    let result;
    if (auth.currentUser.providerData[0].providerId === "password") {
      result = await reauthenticateUser(password); // Reautenticación con contraseña
    } else {
      result = await reauthenticateWithGoogle(); // Reautenticación con Google
    }

    if (!result.success) {
      setError("Error en la autenticación. Por favor, verifica tu información.");
      return;
    }

    // Validar si el número de tarjeta ya existe (excluyendo la actual)
    const cardsQuery = query(collection(db, 'cards'), where('cardNumber', '==', cardNumber.replace(/\s/g, '')));
    const querySnapshot = await getDocs(cardsQuery);

    if (!querySnapshot.empty && querySnapshot.docs[0].id !== cardData.cardId) {
      setError('El número de tarjeta ya ha sido registrado. Intenta con otro.');
      return;
    }

    try {
      const cardDocRef = doc(db, 'cards', cardData.cardId);

      await updateDoc(cardDocRef, {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate: expiryDate,
        cvv: cvv,
        cardHolderName: cardHolderName,
        cardType: cardType,
        updatedAt: new Date(),
      });
      
      alert("Tarjeta actualizada correctamente");
      onCardUpdated(); // Notificar que la tarjeta ha sido actualizada
      handleClose(); // Cerrar el modal
    } catch (error) {
      console.error("Error al actualizar la tarjeta:", error);
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
              <FaUser className="me-2" /> Nombre en la Tarjeta
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="cardNumber" className="mb-3">
            <Form.Label column sm={4}>
              <FaCreditCard className="me-2" /> Número de Tarjeta
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

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="expiryDate">
                <Form.Label>
                  <FaCalendarAlt className="me-2" /> Fecha de Expiración
                </Form.Label>
                <Form.Control
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value.replace(/[^0-9/]/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2'))}
                  required
                />
              </Form.Group>
            </Col>

            <Col>
              <Form.Group controlId="cvv">
                <Form.Label>
                  <FaLock className="me-2" /> CVV
                </Form.Label>
                <Form.Control
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength="4"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Campo de contraseña si el usuario inició sesión con correo y contraseña */}
          {auth.currentUser.providerData[0].providerId === "password" && (
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>
                <FaKey className="me-2" /> Contraseña
              </Form.Label>
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

          <Button variant="primary" type="submit" disabled={isButtonDisabled}>
            Actualizar Tarjeta
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateCardModal;
