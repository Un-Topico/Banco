import React, { useState, useRef } from 'react';
import { Button, Alert, Container, Row, Col, InputGroup, FormControl, Modal, Form } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../auth/authContext';
import { reauthenticateUser, reauthenticateWithGoogle } from '../../auth/auth';
import { verifyCardOwnershipAndBalance, saveQrCode } from '../../api/qrDepositApi'; // Importar funciones de la API

export const QrDepositForm = ({ selectedCardId, onBalanceUpdate }) => {
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState(null);
  const qrRef = useRef(null);
  const { currentUser } = useAuth();

  // Función para manejar el cambio de monto
  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const regex = /^\d*\.?\d{0,2}$/;

    if (regex.test(sanitizedValue) || sanitizedValue === '') {
      setAmount(sanitizedValue);
    }
  };

  // Validar el monto ingresado
  const isValidAmount = (amount) => {
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(amount) && parseFloat(amount) > 0;
  };

  // Función para generar el QR
  const generateQrCode = async () => {
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

      // Verificar la tarjeta y el saldo del usuario
      const cardData = await verifyCardOwnershipAndBalance(selectedCardId, currentUser.uid, parsedAmount);

      // Generar un ID único para la transacción
      const transactionId = `qr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const qrData = {
        transactionId,
        amount: parsedAmount,
        creatorId: currentUser.uid,
        cardId: selectedCardId,
        used: false,
        createdAt: new Date(),
      };

      // Guardar la información en Firestore
      await saveQrCode(qrData);

      // Generar el código QR para mostrar
      setQrCode(transactionId);
      setSuccess('Código QR generado exitosamente.');

      // Actualizar el saldo si es necesario
      if (onBalanceUpdate) {
        onBalanceUpdate(cardData.balance - parsedAmount);
      }
    } catch (error) {
      console.error(error);
      setError(error.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    }
  };

  // Función para manejar la solicitud de reautenticación
  const handleRequestReauth = () => {
    setShowReauthModal(true);
  };

  // Función para manejar la confirmación de reautenticación y generar el QR
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
          await generateQrCode();
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
          await generateQrCode();
        } else {
          setReauthError(reauthResult.message);
        }
      }
    } catch (error) {
      setReauthError(error.message || 'Error en la reautenticación.');
    }
  };

  // Función para manejar la descarga del QR
  const handleDownloadQrCode = () => {
    const qrCanvas = qrRef.current.querySelector('canvas');
    const pngUrl = qrCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `codigo_qr_${Date.now()}.png`;
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

          <Button variant="primary" onClick={handleRequestReauth} disabled={!amount}>
            Generar Código QR
          </Button>

          {qrCode && (
            <div className="mt-3">
              <h5>Escanea este código QR para depositar:</h5>
              <div ref={qrRef}>
                <QRCodeCanvas value={qrCode} size={256} />
              </div>
              <Button className="mt-2" onClick={handleDownloadQrCode} variant="secondary">
                Descargar Código QR
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Modal para reautenticación */}
      <Modal show={showReauthModal} onHide={() => setShowReauthModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reautenticación Requerida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              Reautenticar y Generar QR
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
