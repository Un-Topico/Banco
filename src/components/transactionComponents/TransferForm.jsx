// src/components/transactionComponents/TransferForm.jsx

import React, { useState, useEffect } from 'react';
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
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  getAuth, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { reauthenticateUser, reauthenticateWithGoogle } from '../../auth/auth';
import { useAuth } from '../../auth/authContext';
import Contacts from '../userComponents/Contacts';

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
  const db = getFirestore();
  const navigate = useNavigate();

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
  }, [email, clabe, monto]);

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
      const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');

      if (isGoogleUser) {
        // Reautenticación con Google
        const reauthResult = await reauthenticateWithGoogle();

        if (reauthResult.success) {
          await proceedWithTransfer();
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

  // Función para proceder con la transferencia
  const proceedWithTransfer = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const parsedMonto = parseFloat(monto);

      // Validaciones en el backend
      if (isNaN(parsedMonto) || parsedMonto <= 0) {
        throw new Error('El monto debe ser un número válido mayor que cero.');
      }

      if (!/^(\d+(\.\d{0,2})?)?$/.test(monto)) {
        throw new Error('El monto no puede tener más de 2 decimales.');
      }

      if (parsedMonto > selectedCard.balance) {
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      }

      let recipientCardDoc;

      if (clabe) {
        recipientCardDoc = await getCardDocByClabe(clabe);
      } else if (email) {
        recipientCardDoc = await getCardDocByEmail(email);
      }

      if (!recipientCardDoc) {
        throw new Error('No se encontró la tarjeta del destinatario.');
      }

      const newBalance = selectedCard.balance - parsedMonto;
      if (newBalance < 0) {
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      }

      const recipientOwnerId = recipientCardDoc.data().ownerId;
      const recipientNewBalance = recipientCardDoc.data().balance + parsedMonto;

      // Actualizar el saldo de la tarjeta del remitente
      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });

      // Actualizar el saldo de la tarjeta del destinatario
      const recipientCardRef = doc(db, 'cards', recipientCardDoc.id);
      await setDoc(recipientCardRef, { balance: recipientNewBalance }, { merge: true });

      // Guardar la transferencia en la colección 'transfers'
      const transferId = `transfer_${Date.now()}`;
      const transferRef = doc(db, 'transfers', transferId);

      await setDoc(transferRef, {
        transfer_id: transferId,
        from_card_id: selectedCard.id,
        to_card_id: recipientCardDoc.id,
        amount: parsedMonto,
        transfer_date: new Date(),
        description: descripcion || 'Sin descripción',
      });

      // Guardar las transacciones en la colección 'transactions'
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'sent',
      });
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now() + 1}`,
        card_id: recipientCardDoc.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: descripcion || 'Sin descripción',
        status: 'received',
      });

      // Crear la notificación para el destinatario
      await addDoc(collection(db, 'notifications'), {
        notificationId: `notification_${Date.now()}`,
        transfer_id: transferId,
        ownerId: recipientOwnerId,
        message: `Has recibido una transferencia de $${parsedMonto} MXN.`,
        cardId: recipientCardDoc.id,
        read: false,
        timestamp: new Date(),
      });

      // Enviar mensaje al destinatario si tiene número de teléfono
      const recipientPhoneNumber = recipientCardDoc.data().phoneNumber;
      if (recipientPhoneNumber) {
        await sendMessage(recipientPhoneNumber, parsedMonto);
      }

      setSuccess('La transferencia se ha realizado con éxito.');
      setEmail('');
      setClabe('');
      setMonto('');
      setDescripcion('');
      onFormChange({ recipientInfo: '', amount: '' }); // Resetear el formulario en el componente padre
    } catch (error) {
      console.error(error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la tarjeta del destinatario por correo electrónico
  const getCardDocByEmail = async (email) => {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una cuenta asociada a este correo electrónico.');
    }

    const recipientAccount = querySnapshot.docs[0].data();
    const recipientOwnerId = recipientAccount.ownerId;

    const cardsRef = collection(db, 'cards');
    const cardQuery = query(cardsRef, where('ownerId', '==', recipientOwnerId));
    const cardSnapshot = await getDocs(cardQuery);

    if (cardSnapshot.empty) {
      throw new Error('El destinatario no tiene una tarjeta asociada.');
    }

    return cardSnapshot.docs[0];
  };

  // Función para obtener la tarjeta del destinatario por CLABE
  const getCardDocByClabe = async (clabe) => {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('clabeNumber', '==', clabe));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una tarjeta asociada a este número CLABE.');
    }

    return querySnapshot.docs[0];
  };

  // Función para enviar mensaje al destinatario
  const sendMessage = async (phoneNumber, amount) => {
    try {
      const response = await fetch(
        'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/twilio-package/send-message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phoneNumber,
            body: `Has recibido una transferencia de ${amount} MXN.`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  // Función para manejar el envío de la contraseña y proceder con la transferencia
  const handlePasswordSubmit = async () => {
    setError('');
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, passwordInput);
      await reauthenticateWithCredential(currentUser, credential);

      setShowReauthModal(false);
      setPasswordInput('');

      // Autenticación exitosa, proceder con la transferencia
      await proceedWithTransfer();
    } catch (error) {
      console.error(error);
      setError('Contraseña incorrecta. Intenta de nuevo.');
    }
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
                  /> Procesando...
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
            Reautenticar y Transferir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
