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

  const handleGenerateQrCode = async () => {
    setError(null);
    setSuccess(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Por favor, ingresa una cantidad válida.');
      }

      // Obtener la tarjeta seleccionada
      const cardDocRef = doc(db, 'cards', selectedCardId);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        throw new Error('Tarjeta no encontrada');
      }

      const cardData = cardDoc.data();
      if (cardData.balance < parseFloat(amount)) {
        throw new Error('No tienes suficiente saldo para generar el código QR');
      }

      // Generar un código QR único
      const transactionId = `qr_${Date.now()}`;
      const qrData = {
        transactionId,
        amount: parseFloat(amount),
        creatorId: currentUser.uid,
        cardId: selectedCardId,
        used: false,  // Indica si ya fue utilizado
      };

      // Guardar la información en Firestore
      await setDoc(doc(db, 'qr_codes', transactionId), qrData);

      // Generar el código QR para mostrar
      setQrCode(transactionId);
      setSuccess('Código QR generado exitosamente');
    } catch (error) {
      setError(error.message);
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
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingresa el monto"
              required
            />
          </InputGroup>

          <Button variant="primary" onClick={handleGenerateQrCode}>
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
