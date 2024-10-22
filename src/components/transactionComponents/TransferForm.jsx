import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { reauthenticateWithGoogle } from '../../auth/auth';
import { useAuth } from '../../auth/authContext';
import Contacts from '../userComponents/Contacts';

// Importamos las funciones del backend
import { proceedWithTransfer } from '../../api/transferApi';

export const TransferForm = ({ selectedCard, onFormChange }) => {
  const [email, setEmail] = useState('');
  const [clabe, setClabe] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentUser } = useAuth();
  // Validaciones
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Validar si el formulario es válido
    const recipientInfo = email || clabe;
    const parsedMonto = parseFloat(monto);

    const montoValido =
      monto &&
      !isNaN(parsedMonto) &&
      parsedMonto > 0 &&
      parsedMonto <= selectedCard.balance &&
      /^(\d+(\.\d{0,2})?)?$/.test(monto);

    const recipientValid = recipientInfo && recipientInfo.trim() !== '';

    setIsFormValid(montoValido && recipientValid);
  }, [email, clabe, monto, selectedCard]);

  // Actualizar el formulario en el componente padre
  useEffect(() => {
    const recipientInfo = email || clabe;
    onFormChange({ recipientInfo, amount: monto });
  }, [email, clabe, monto, onFormChange]);

  // Función para manejar cambios en el monto
  const handleMontoChange = (value) => {
    const formattedValue = value.replace(/[^0-9.]/g, ''); // Remover caracteres no numéricos excepto el punto
    const decimalCheck = /^(\d+(\.\d{0,2})?)?$/.test(formattedValue); // Verificar que tenga un máximo de 2 decimales

    if (decimalCheck) {
      setMonto(formattedValue);
    }
  };

  // Función para manejar el clic en "Transferir" que abre el modal de confirmación
  const handleTransferenciaClick = () => {
    setError('');
    setSuccess('');

    if (!selectedCard) {
      setError('Por favor, selecciona una tarjeta válida.');
      return;
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un monto válido.');
      return;
    }

    const parsedMonto = parseFloat(monto);
    if (parsedMonto > selectedCard.balance) {
      setError('No tienes suficiente saldo para realizar esta transferencia.');
      return;
    }

    if (!email && !clabe) {
      setError('Por favor ingresa un correo electrónico o un número CLABE del destinatario.');
      return;
    }

    // Abrir el modal de confirmación
    setShowConfirmModal(true);
  };

  // Función para proceder con la reautenticación después de la confirmación
  const handleConfirmProceed = async () => {
    setShowConfirmModal(false);
    await initiateReauthentication();
  };

  // Función para iniciar la reautenticación
  const initiateReauthentication = async () => {
    try {
      // Determinar el método de inicio de sesión
      const providerData = currentUser.providerData;
      const isGoogleUser = providerData.some(
        (provider) => provider.providerId === 'google.com'
      );

      if (isGoogleUser) {
        // Reautenticación con Google
        const reauthResult = await reauthenticateWithGoogle();

        if (reauthResult.success) {
          await handleProceedWithTransfer();
        } else {
          setError(reauthResult.message);
        }
      } else {
        // Reautenticación con correo y contraseña
        setShowReauthModal(true);
      }
    } catch (err) {
      console.error(err);
      setError('Error en la reautenticación.');
    }
  };

  // Función para manejar el envío de la contraseña y proceder con la transferencia
  const handlePasswordSubmit = async () => {
    setError('');
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordInput
      );
      await reauthenticateWithCredential(currentUser, credential);

      setShowReauthModal(false);
      setPasswordInput('');

      // Autenticación exitosa, proceder con la transferencia
      await handleProceedWithTransfer();
    } catch (error) {
      console.error(error);
      setError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  // Función para proceder con la transferencia utilizando la API
  const handleProceedWithTransfer = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await proceedWithTransfer({
      selectedCard,
      amount: monto,
      email,
      clabe,
      description: descripcion,
    });

    if (result.success) {
      setSuccess(result.message);
      setEmail('');
      setClabe('');
      setMonto('');
      setDescripcion('');
      onFormChange({ recipientInfo: '', amount: '' }); // Resetear el formulario en el componente padre
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Función para manejar la selección de un contacto
  const handleContactSelect = (selectedEmail) => {
    setEmail(selectedEmail);
    setClabe('');
  };

  // Determinar si los campos están deshabilitados
  const isEmailDisabled = clabe !== '';
  const isClabeDisabled = email !== '';

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <h2 className="text-center mb-4">Transferir Fondos</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            {/* Campo de correo electrónico */}
            <Form.Group controlId="email">
              <Form.Label>Correo Electrónico de Destino</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese correo electrónico de destino"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailDisabled}
                required={!clabe}
              />
            </Form.Group>

            {/* Campo de CLABE */}
            <Form.Group controlId="clabe" className="mt-3">
              <Form.Label>Número CLABE de Destino</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese CLABE de destino"
                value={clabe}
                onChange={(e) => setClabe(e.target.value)}
                disabled={isClabeDisabled}
                required={!email}
              />
            </Form.Group>

            {/* Campo de monto */}
            <Form.Group controlId="monto" className="mt-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el monto"
                value={monto}
                onChange={(e) => handleMontoChange(e.target.value)}
                required
              />
            </Form.Group>

            {/* Campo de descripción */}
            <Form.Group controlId="descripcion" className="mt-3">
              <Form.Label>Descripción Breve (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Descripción breve (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </Form.Group>

            {/* Componente de contactos */}
            <Contacts currentUser={currentUser} onContactSelect={handleContactSelect} />

            {/* Botón para realizar la transferencia */}
            <Button
              variant="primary"
              className="mt-4 w-100"
              onClick={handleTransferenciaClick}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Procesando...
                </>
              ) : (
                'Transferir'
              )}
            </Button>
          </Form>
        </Col>
      </Row>

      {/* Modal de Confirmación para Reautenticación */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reautenticación Necesaria</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para proceder con la transferencia, es necesario que te reautentiques.</p>
          <p>¿Deseas continuar?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmProceed}>
            Continuar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para ingresar la contraseña */}
      <Modal show={showReauthModal} onHide={() => setShowReauthModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reautenticación Requerida</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña actual"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </Form.Group>
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReauthModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handlePasswordSubmit}
            disabled={!passwordInput}
          >
            Reautenticar y Transferir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
