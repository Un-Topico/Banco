import { useState, useEffect, useCallback, useRef } from "react";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import Contacts from "./Contacts";
import { handleTransaction } from "../services/transactionService";
import { getCardDoc, listenToCardDoc } from "../services/firestoreTransactionService";

export const TransactionsForm = ({ currentUser, selectedCardId, updateBalance }) => {
  const [transactionType, setTransactionType] = useState("Deposito");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientClabe, setRecipientClabe] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const lastBalanceRef = useRef(null); // Usar useRef para almacenar el último balance

  // Memoriza la función updateBalance para evitar renderizados innecesarios
  const memoizedUpdateBalance = useCallback((newBalance) => {
    // Comparamos el balance actual con el último balance conocido
    if (newBalance !== lastBalanceRef.current) {
      updateBalance(newBalance);
      lastBalanceRef.current = newBalance; // Actualizamos el balance
    }
  }, [updateBalance]);

  useEffect(() => {
    if (selectedCardId) {
      const unsubscribe = listenToCardDoc(selectedCardId, memoizedUpdateBalance);
      return () => unsubscribe();
    }
  }, [selectedCardId, memoizedUpdateBalance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const cardDoc = await getCardDoc(selectedCardId);

      // Validar campo de entrada
      if (transactionType === "Transferencia" && !recipientEmail && !recipientClabe) {
        throw new Error("Debes ingresar un correo electrónico o un número CLABE del destinatario.");
      }

      await handleTransaction(
        cardDoc,
        transactionType,
        amount,
        description,
        recipientEmail,
        recipientClabe,
        currentUser,
        memoizedUpdateBalance // Pasa la función memorizada
      );

      // Limpiar campos del formulario después de una transacción exitosa
      setAmount("");
      setDescription("");
      setRecipientEmail("");
      setRecipientClabe("");
      setSuccess("Transacción realizada con éxito.");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleContactSelect = (email) => {
    setRecipientEmail(email);
    setRecipientClabe(""); // Limpiar número CLABE si se selecciona un contacto
  };

  // Determinar si los campos deben estar deshabilitados
  const isEmailDisabled = recipientClabe !== "";
  const isClabeDisabled = recipientEmail !== "";

  return (
    <Container>
      <Row className="justify-content-center">
        <Col>
          <h2>Realizar Transacción</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Transacción</Form.Label>
              <Form.Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option value="Deposito">Depósito</option>
                <option value="Retiro">Retiro</option>
                <option value="Transferencia">Transferencia</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ingresa el monto"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
              />
            </Form.Group>

            {transactionType === "Transferencia" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Correo del destinatario</Form.Label>
                  <Form.Control
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Ingresa el correo del destinatario"
                    disabled={isEmailDisabled}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Número CLABE del destinatario</Form.Label>
                  <Form.Control
                    type="text"
                    value={recipientClabe}
                    onChange={(e) => setRecipientClabe(e.target.value)}
                    placeholder="Ingresa el número CLABE del destinatario"
                    disabled={isClabeDisabled}
                  />
                </Form.Group>
                <Contacts
                  currentUser={currentUser}
                  setError={setError}
                  setSuccess={setSuccess}
                  onContactSelect={handleContactSelect}
                />
              </>
            )}

            <Button variant="primary" type="submit">
              Realizar Transacción
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
