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
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { reauthenticateUser, reauthenticateWithGoogle } from '../../auth/auth'; // Asegúrate de que estas funciones estén definidas
import { useAuth } from '../../auth/authContext'; // Asumiendo que tienes un contexto de autenticación

export const RetirarForm = ({ selectedCard, onDepositAmountChange }) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Nuevo estado para el modal de confirmación
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { currentUser } = useAuth();
  const db = getFirestore();

  // Función para manejar el cambio en el monto
  const handleMontoChange = (value) => {
    const formattedValue = value.replace(/[^0-9.]/g, ''); // Remover caracteres no numéricos excepto el punto
    const decimalCheck = /^(\d+(\.\d{0,2})?)?$/.test(formattedValue); // Verificar que tenga un máximo de 2 decimales

    if (decimalCheck) {
      setMonto(formattedValue);
      onDepositAmountChange(formattedValue); // Llamar al manejador para actualizar el monto en el componente padre
    }
  };

  // Función para manejar el clic en "Realizar Retiro" que abre el modal de confirmación
  const handleRetiroClick = () => {
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

    const parsedMonto = parseFloat(monto);
    if (parsedMonto > selectedCard.balance) {
      setError('No tienes suficiente saldo para realizar el retiro.');
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
      const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');

      if (isGoogleUser) {
        // Reautenticación con Google
        const reauthResult = await reauthenticateWithGoogle();

        if (reauthResult.success) {
          await proceedWithRetiro();
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

  const proceedWithRetiro = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const parsedMonto = parseFloat(monto);
      const newBalance = selectedCard.balance - parsedMonto;

      // Actualizar el balance de la tarjeta
      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });

      // Agregar la transacción
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Retiro',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'sent',
        ownerId: selectedCard.ownerId,
      });

      setSuccess('El retiro se ha realizado con éxito.');
      setMonto('');
      setDescripcion('');
      onDepositAmountChange(0); // Resetear el monto en el componente padre
    } catch (err) {
      console.error(err);
      setError(`Hubo un error al realizar el retiro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordInput);
      await reauthenticateWithCredential(currentUser, credential);

      setShowReauthModal(false);
      setPasswordInput('');

      // Autenticación exitosa, proceder con el retiro
      await proceedWithRetiro();
    } catch (err) {
      console.error(err);
      setError('Contraseña incorrecta. Intenta de nuevo.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Retirar Fondos</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form>
            <Form.Group controlId="monto">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el monto"
                value={monto}
                onChange={(e) => handleMontoChange(e.target.value)} // Cambiar a la nueva función
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
              onClick={handleRetiroClick} 
              disabled={loading || !monto || parseFloat(monto) <= 0} // Deshabilitar si el monto no es válido
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
                'Realizar Retiro'
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
          <p>Para proceder con el retiro, es necesario que te reautentiques.</p>
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
            disabled={!passwordInput}
          >
            Reautenticar y Retirar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
