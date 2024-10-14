import React, { useState, useRef } from 'react';
import { Button, Alert, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';  // Importa QRCodeCanvas para generar el QR
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../auth/authContext';

export const QrDepositForm = ({ selectedCardId }) => {
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const qrRef = useRef(null);  // Referencia al elemento QRCodeCanvas
  const { currentUser } = useAuth();
  const db = getFirestore();

  const handleAmountChange = (e) => {
    const value = e.target.value;

    // Remover cualquier carácter que no sea número o punto decimal
    const sanitizedValue = value.replace(/[^0-9.]/g, '');

    // Permitir solo dos decimales
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(sanitizedValue) || sanitizedValue === '') {
      setAmount(sanitizedValue);
    }
  };

  const isValidAmount = (amount) => {
    // Verificar que el monto es un número positivo con hasta dos decimales
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(amount) && parseFloat(amount) > 0;
  };

  const handleGenerateQrCode = async () => {
    setError(null);
    setSuccess(null);

    try {
      if (!amount || !isValidAmount(amount)) {
        throw new Error('Por favor, ingresa una cantidad válida (número positivo con hasta dos decimales).');
      }

      const parsedAmount = parseFloat(amount);

      // Limitar el monto máximo permitido (por ejemplo, 10,000)
      if (parsedAmount > 10000) {
        throw new Error('El monto máximo permitido es 10,000.');
      }

      if (!currentUser) {
        throw new Error('Usuario no autenticado.');
      }

      // Obtener la tarjeta seleccionada
      const cardDocRef = doc(db, 'cards', selectedCardId);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        throw new Error('Tarjeta no encontrada.');
      }

      const cardData = cardDoc.data();

      // Verificar que la tarjeta pertenece al usuario actual
      if (cardData.ownerId !== currentUser.uid) {
        throw new Error('No tienes permiso para generar un código QR para esta tarjeta.');
      }

      if (cardData.balance < parsedAmount) {
        throw new Error('No tienes suficiente saldo para generar el código QR.');
      }

      // Generar un ID único para la transacción
      const transactionId = `qr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const qrData = {
        transactionId,
        amount: parsedAmount,
        creatorId: currentUser.uid,
        cardId: selectedCardId,
        used: false,  // Indica si ya fue utilizado
        createdAt: new Date(),
      };

      // Guardar la información en Firestore
      await setDoc(doc(db, 'qr_codes', transactionId), qrData);

      // Generar el código QR para mostrar
      setQrCode(transactionId);
      setSuccess('Código QR generado exitosamente.');
    } catch (error) {
      console.error(error);
      setError(error.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    }
  };

  const handleDownloadQrCode = () => {
    const qrCanvas = qrRef.current.querySelector('canvas');
    const pngUrl = qrCanvas.toDataURL('image/png');  // Convertir el canvas a imagen PNG

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `codigo_qr_${Date.now()}.png`;  // Nombre del archivo
    downloadLink.click();
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <InputGroup className="mb-3">
            <FormControl
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Ingresa el monto"
              required
            />
          </InputGroup>

          <Button variant="primary" onClick={handleGenerateQrCode} disabled={!amount}>
            Generar Código QR
          </Button>

          {qrCode && (
            <div className="mt-3">
              <h5>Escanea este código QR para depositar:</h5>
              <div ref={qrRef}>
                <QRCodeCanvas value={qrCode} size={256} /> {/* Cambiado a QRCodeCanvas */}
              </div>
              <Button className="mt-2" onClick={handleDownloadQrCode} variant="secondary">
                Descargar Código QR
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};
