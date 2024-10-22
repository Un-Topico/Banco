import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../auth/authContext';
import jsQR from "jsqr";  // Biblioteca para leer el QR desde una imagen
import { verifyQrCode, verifyCardBalance, updateCardBalance, markQrCodeAsUsed, saveTransaction, getUserCards } from '../../api/qrScanApi'; // Importar funciones desde la API

export const QrScanForm = () => {
  const [qrCodeData, setQrCodeData] = useState(null); // Para almacenar los datos del QR
  const [selectedCard, setSelectedCard] = useState(''); // Para la tarjeta seleccionada
  const [userCards, setUserCards] = useState([]); // Tarjetas del usuario receptor
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { currentUser } = useAuth();

  // Obtener las tarjetas del usuario receptor (usuario actual)
  useEffect(() => {
    const loadUserCards = async () => {
      try {
        const cardsData = await getUserCards(currentUser.uid);
        setUserCards(cardsData);
        if (cardsData.length > 0) {
          setSelectedCard(cardsData[0].id); // Seleccionar la primera tarjeta por defecto
        }
      } catch (error) {
        setError('Error al obtener las tarjetas del usuario.');
      }
    };

    loadUserCards();
  }, [currentUser]);

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
      const qrData = await verifyQrCode(qrCodeData);

      // Verificar que la tarjeta del creador tenga suficiente saldo
      const cardData = await verifyCardBalance(qrData.cardId, qrData.amount);

      // Descontar el dinero de la tarjeta del creador
      const newBalance = cardData.balance - qrData.amount;
      await updateCardBalance(qrData.cardId, newBalance);

      // Obtener la tarjeta del receptor (usuario actual) y actualizar su saldo
      const receiverCardData = await verifyCardBalance(selectedCard, 0);
      const newReceiverBalance = receiverCardData.balance + qrData.amount;
      await updateCardBalance(selectedCard, newReceiverBalance);

      // Marcar el código QR como usado
      await markQrCodeAsUsed(qrCodeData);

      // Guardar las transacciones para el creador y el receptor
      const transactionId = `transaction_${Date.now()}`;
      await saveTransaction({
        transaction_id: transactionId,
        card_id: qrData.cardId,
        transaction_type: "Deposito",
        amount: qrData.amount,
        transaction_date: new Date(),
        description: "Depósito vía QR",
        status: "sent",
      });
      await saveTransaction({
        transaction_id: `transaction_receiver_${Date.now()}`,
        card_id: selectedCard,
        transaction_type: "Deposito",
        amount: qrData.amount,
        transaction_date: new Date(),
        description: "Depósito vía QR",
        status: "received",
      });

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
