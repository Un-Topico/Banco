import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, Alert, Container, Row, Col, InputGroup, Modal } from 'react-bootstrap';
import Contacts from '../userComponents/Contacts';
import { handleTransaction } from '../../services/transactionService';
import { getCardDoc, listenToCardDoc } from '../../services/firestoreTransactionService';
import { FaMoneyBillAlt, FaUser, FaCommentAlt, FaPiggyBank } from 'react-icons/fa';
import { QrDepositForm } from './QrDepositForm';
import { reauthenticateUser, reauthenticateWithGoogle } from '../../auth/auth'; // Asegúrate de importar las funciones de reautenticación

export const TransactionsForm = ({ currentUser, selectedCardId, updateBalance }) => {
  const [transactionType, setTransactionType] = useState('Deposito');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientClabe, setRecipientClabe] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para la reautenticación
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthError, setReauthError] = useState(null);

  const lastBalanceRef = useRef(null);

  const memoizedUpdateBalance = useCallback(
    (newBalance) => {
      if (newBalance !== lastBalanceRef.current) {
        updateBalance(newBalance);
        lastBalanceRef.current = newBalance;
      }
    },
    [updateBalance]
  );

  useEffect(() => {
    if (selectedCardId) {
      const unsubscribe = listenToCardDoc(selectedCardId, memoizedUpdateBalance);
      return () => unsubscribe();
    }
  }, [selectedCardId, memoizedUpdateBalance]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(sanitizedValue) || sanitizedValue === '') {
      setAmount(sanitizedValue);
    }
  };

  const handleContactSelect = (email) => {
    setRecipientEmail(email);
    setRecipientClabe('');
  };

  const isEmailDisabled = recipientClabe !== '';
  const isClabeDisabled = recipientEmail !== '';

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error(
          'Por favor, ingresa una cantidad válida (número positivo con hasta dos decimales).'
        );
      }

      const parsedAmount = parseFloat(amount);

      if (parsedAmount > 10000) {
        throw new Error('El monto máximo permitido es 10,000.');
      }

      // const cardDoc = await getCardDoc(selectedCardId);
      if (transactionType === 'Transferencia' && !recipientEmail && !recipientClabe) {
        throw new Error(
          'Debes ingresar un correo electrónico o un número CLABE del destinatario.'
        );
      }

      // Mostrar el modal de reautenticación
      setShowReauthModal(true);
    } catch (error) {
      setError(error.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    }
  };

  // Función para manejar la confirmación de reautenticación y procesar la transacción
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
          await processTransaction();
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
          await processTransaction();
        } else {
          setReauthError(reauthResult.message);
        }
      }
    } catch (error) {
      setReauthError(error.message || 'Error en la reautenticación.');
    }
  };

  // Función para procesar la transacción
  const processTransaction = async () => {
    try {
      const parsedAmount = parseFloat(amount);
      const cardDoc = await getCardDoc(selectedCardId);

      await handleTransaction(
        cardDoc,
        transactionType,
        parsedAmount,
        description,
        recipientEmail,
        recipientClabe,
        currentUser,
        memoizedUpdateBalance
      );

      setAmount('');
      setDescription('');
      setRecipientEmail('');
      setRecipientClabe('');
      setSuccess('Transacción realizada con éxito.');
    } catch (error) {
      setError(error.message || 'Ha ocurrido un error. Inténtalo de nuevo.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Transacción</Form.Label>
              <Form.Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <option value="Deposito">Depósito</option>
                <option value="Retiro">Retiro</option>
                <option value="Transferencia">Transferencia</option>
                <option value="DepositoQr">Depósito por QR</option>
              </Form.Select>
            </Form.Group>

            {transactionType === 'DepositoQr' ? (
              <QrDepositForm selectedCardId={selectedCardId} updateBalance={updateBalance} />
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaMoneyBillAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="Ingresa el monto"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCommentAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripción opcional"
                    />
                  </InputGroup>
                </Form.Group>

                {transactionType === 'Transferencia' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo del destinatario</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUser />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="Ingresa el correo del destinatario"
                          disabled={isEmailDisabled}
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Número CLABE del destinatario</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaPiggyBank />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={recipientClabe}
                          onChange={(e) => setRecipientClabe(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ingresa el número CLABE del destinatario"
                          disabled={isClabeDisabled}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Contacts
                      currentUser={currentUser}
                      setError={setError}
                      setSuccess={setSuccess}
                      onContactSelect={handleContactSelect}
                    />
                  </>
                )}
                <Row className="mt-4">
                  <Col sm={{ span: 8, offset: 4 }} className="text-end">
                    <Button variant="primary" type="submit" disabled={!amount}>
                      Realizar Transacción
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </Col>
      </Row>

      {/* Modal para reautenticación */}
      <Modal show={showReauthModal} onHide={() => setShowReauthModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reautenticación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Determinar el método de autenticación */}
          {currentUser.providerData.some(provider => provider.providerId === 'google.com') ? (
            <div>
              <p>Para continuar, reautentícate usando tu cuenta de Google.</p>
             
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
          <Button variant="danger" onClick={handleConfirmReauth}>
                Reautenticarse con Google
              </Button>
          {!currentUser.providerData.some(provider => provider.providerId === 'google.com') && (
            <Button variant="primary" onClick={handleConfirmReauth} disabled={!reauthPassword}>
              Reautenticar y Realizar Transacción
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
