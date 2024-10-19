// src/components/DepositForm.jsx

import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Alert, 
  Modal, 
  Spinner 
} from 'react-bootstrap';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../../auth/authContext'; // Asegúrate de que esta ruta sea correcta
import { 
  initiateReauthentication, 
  proceedWithDeposit, 
  reauthenticateWithEmail 
} from '../../api/depositApi'; // Ajusta la ruta según tu estructura de carpetas

export const DepositForm = ({ selectedCard, onDepositAmountChange }) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { currentUser } = useAuth();
  const db = getFirestore();

  // Función para manejar el cambio en el input de monto
  const handleMontoInput = (e) => {
    const value = e.target.value;

    // Permitir campo vacío
    if (value === '') {
      setMonto('');
      onDepositAmountChange(0);
      return;
    }

    // Validar con regex
    const montoRegex = /^\d+(\.\d{0,2})?$/;
    if (montoRegex.test(value)) {
      setMonto(value);
      onDepositAmountChange(parseFloat(value));
    }
    // Si no pasa la validación, no actualizar el estado
  };

  // Función para manejar el clic en "Depositar" que abre el modal de confirmación
  const handleDepositoClick = () => {
    setError(null);
    setSuccess(null);

    if (!selectedCard) {
      setError('Por favor, selecciona una tarjeta válida.');
      return;
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un monto válido.');
      return;
    }

    // Abrir el modal de confirmación
    setShowConfirmModal(true);
  };

  // Función para proceder con la reautenticación después de la confirmación
  const handleConfirmProceed = async () => {
    setShowConfirmModal(false);
    try {
      const reauthResult = await initiateReauthentication(currentUser);

      if (reauthResult.requiresPassword) {
        setShowReauthModal(true);
      } else if (reauthResult.success) {
        await handleDeposit();
      } else {
        setError(reauthResult.message || 'Reautenticación fallida.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Función para manejar el depósito utilizando la API
  const handleDeposit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedMonto = parseFloat(monto);

      await proceedWithDeposit({
        db,
        selectedCard,
        monto: parsedMonto,
        descripcion,
      });

      setSuccess('El depósito se ha realizado con éxito.');
      setMonto('');
      setDescripcion('');
      onDepositAmountChange(0);
    } catch (err) {
      console.error(err);
      setError(`Hubo un error al realizar el depósito: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío de la contraseña para reautenticación
  const handlePasswordSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await reauthenticateWithEmail({
        email: currentUser.email,
        password: passwordInput,
      });

      setShowReauthModal(false);
      setPasswordInput('');

      await handleDeposit();
    } catch (err) {
      console.error(err);
      setError('Contraseña incorrecta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Depositar Fondos</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            <Form.Group controlId="monto">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="text" // Cambiado a 'text' para mejor control con regex
                placeholder="Ingrese el monto"
                value={monto}
                onChange={handleMontoInput}
                inputMode="decimal"
                pattern="^\d+(\.\d{0,2})?$"
                required
              />
            </Form.Group>

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

            <Button 
              variant="primary" 
              className="mt-4 w-100" 
              onClick={handleDepositoClick} 
              disabled={loading || !monto || parseFloat(monto) <= 0}
            >
              {loading ? (
                <>
                  <Spinner 
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  /> Procesando...
                </>
              ) : (
                'Depositar'
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
          <p>Para proceder con el depósito, es necesario que te reautentiques.</p>
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
              />
            </Form.Group>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReauthModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePasswordSubmit} 
            disabled={!passwordInput || loading}
          >
            {loading ? (
              <>
                <Spinner 
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Reautenticando...
              </>
            ) : (
              'Reautenticar y Depositar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
