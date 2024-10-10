import { useState, useEffect, useCallback, useRef } from "react";
import { Form, Button, Alert, Container, Row, Col, InputGroup } from "react-bootstrap";
import Contacts from "../userComponents/Contacts";
import { handleTransaction } from "../../services/transactionService";
import { getCardDoc, listenToCardDoc } from "../../services/firestoreTransactionService";
import { FaMoneyBillAlt, FaUser, FaCommentAlt, FaPiggyBank } from "react-icons/fa";
import { QrDepositForm } from "./QrDepositForm"; // Importa el componente para depósitos por QR

export const TransactionsForm = ({ currentUser, selectedCardId, updateBalance }) => {
  const [transactionType, setTransactionType] = useState("Deposito");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientClabe, setRecipientClabe] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const lastBalanceRef = useRef(null);

  const memoizedUpdateBalance = useCallback((newBalance) => {
    if (newBalance !== lastBalanceRef.current) {
      updateBalance(newBalance);
      lastBalanceRef.current = newBalance;
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
        memoizedUpdateBalance
      );

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
    setRecipientClabe("");
  };

  const isEmailDisabled = recipientClabe !== "";
  const isClabeDisabled = recipientEmail !== "";

  return (
    <Container>
      <Row className="justify-content-center">
        <Col>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Formulario */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Transacción</Form.Label>
              <Form.Select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                <option value="Deposito">Depósito</option>
                <option value="Retiro">Retiro</option>
                <option value="Transferencia">Transferencia</option>
                <option value="DepositoQr">Depósito por QR</option> {/* Nueva opción para QR */}
              </Form.Select>
            </Form.Group>

            {/* Condicional: Mostrar formulario según tipo de transacción */}
            {transactionType === "DepositoQr" ? (
              <QrDepositForm selectedCardId={selectedCardId} updateBalance={updateBalance} /> // Mostrar componente QR si se selecciona "DepositoQr"
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaMoneyBillAlt /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ingresa el monto"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaCommentAlt /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descripción opcional"
                    />
                  </InputGroup>
                </Form.Group>

                {/* Si es una transferencia, mostrar campos adicionales */}
                {transactionType === "Transferencia" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo del destinatario</Form.Label>
                      <InputGroup>
                        <InputGroup.Text><FaUser /></InputGroup.Text>
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
                        <InputGroup.Text><FaPiggyBank /></InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={recipientClabe}
                          onChange={(e) => setRecipientClabe(e.target.value)}
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

                <Button variant="primary" type="submit">
                  Realizar Transacción
                </Button>
              </>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
