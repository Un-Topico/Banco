import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../auth/authContext';
import jsQR from "jsqr";  // Biblioteca para leer el QR desde una imagen

export const QrScanForm = ({ updateBalance }) => {
  const [qrCodeData, setQrCodeData] = useState(null); // Para almacenar los datos del QR
  const [selectedCard, setSelectedCard] = useState(''); // Para la tarjeta seleccionada
  const [userCards, setUserCards] = useState([]); // Tarjetas del usuario receptor
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Obtener las tarjetas del usuario receptor (usuario actual)
  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const cardsQuery = query(
          collection(db, 'cards'),
          where('ownerId', '==', currentUser.uid)
        );
        const cardsSnapshot = await getDocs(cardsQuery);
        const cardsData = cardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserCards(cardsData);
        if (cardsData.length > 0) {
          setSelectedCard(cardsData[0].id); // Seleccionar la primera tarjeta por defecto
        }
      } catch (error) {
        setError('Error al obtener las tarjetas del usuario.');
      }
    };

    fetchUserCards();
  }, [db, currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const image = new Image();
        image.src = event.target.result;
        image.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
          if (qrCode) {
            setQrCodeData(qrCode.data);  // Aquí guardamos el contenido del código QR
          } else {
            setError("No se pudo leer el código QR, intenta con otra imagen.");
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!qrCodeData) {
      setError("Por favor, selecciona una imagen con un código QR válido.");
      return;
    }

    if (!selectedCard) {
      setError("Por favor, selecciona una tarjeta para recibir el depósito.");
      return;
    }

    try {
      // Verificar si el QR ya fue usado
      const qrDocRef = doc(db, 'qr_codes', qrCodeData);
      const qrDoc = await getDoc(qrDocRef);

      if (!qrDoc.exists()) {
        throw new Error('El código QR no es válido.');
      }

      const qrData = qrDoc.data();
      if (qrData.used) {
        throw new Error('El código QR ya fue utilizado.');
      }

      // Obtener la tarjeta del usuario que generó el QR
      const cardDocRef = doc(db, 'cards', qrData.cardId);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        throw new Error('Tarjeta del creador no encontrada.');
      }

      const cardData = cardDoc.data();
      if (cardData.balance < qrData.amount) {
        throw new Error('El usuario no tiene suficiente saldo.');
      }

      // Descontar el dinero de la tarjeta del creador
      const newBalance = cardData.balance - qrData.amount;
      await updateDoc(cardDocRef, { balance: newBalance });

      // Obtener la tarjeta del receptor (usuario actual)
      const receiverCardRef = doc(db, 'cards', selectedCard);
      const receiverCardDoc = await getDoc(receiverCardRef);
      const receiverCardData = receiverCardDoc.data();
      const newReceiverBalance = receiverCardData.balance + qrData.amount;

      // Actualizar el saldo del receptor
      await updateDoc(receiverCardRef, { balance: newReceiverBalance });

      // Marcar el código QR como usado
      await updateDoc(qrDocRef, { used: true });

      // Guardar la transacción en Firestore
      const transactionData = {
        transaction_id: `transaction_${Date.now()}`,
        card_id: qrData.cardId,
        transaction_type: "Deposito",
        amount: qrData.amount,
        transaction_date: new Date(),
        description: "Depósito vía QR",
        status: "sent",
      };
      await setDoc(doc(db, 'transactions', transactionData.transaction_id), transactionData);

      setSuccess('Depósito procesado exitosamente.');
      setQrCodeData(null);  // Limpiar el input del QR
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleScan}>
            <Form.Group className="mb-3">
              <Form.Label>Selecciona la imagen con el código QR</Form.Label>
              <InputGroup>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            {/* Select para seleccionar la tarjeta de destino */}
            <Form.Group className="mb-3">
              <Form.Label>Selecciona la tarjeta de destino</Form.Label>
              <Form.Select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
              >
                {userCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {`Tarjeta terminada en ${card.cardNumber.slice(-4)} - Saldo: $${card.balance}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              Procesar Depósito
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
