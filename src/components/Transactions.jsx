import React, { useState } from "react";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

export const Transactions = ({ selectedCardId, updateBalance }) => {
  const [transactionType, setTransactionType] = useState('Deposito');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(''); // Correo del destinatario
  const [error, setError] = useState(null); // Estado para mostrar errores
  const [success, setSuccess] = useState(null); // Estado para mostrar éxito
  const { currentUser } = useAuth();
  
  const db = getFirestore(app);

  const getCardDoc = async () => {
    try {
      if (!selectedCardId) {
        setError("No se ha seleccionado ninguna tarjeta.");
        return null;
      }

      const cardDocRef = doc(db, "cards", selectedCardId);
      const cardDoc = await getDoc(cardDocRef);

      if (!cardDoc.exists()) {
        setError("La tarjeta seleccionada no existe.");
        return null;
      }
      return cardDoc;
    } catch (error) {
      console.error("Error al obtener el documento de la tarjeta:", error);
      setError("Hubo un error al obtener la tarjeta.");
      return null;
    }
  };

  const updateRecipientBalance = async (recipientDoc, amount) => {
    try {
      const recipientData = recipientDoc.data();
      const recipientNewBalance = recipientData.balance + parseFloat(amount);
      
      await setDoc(recipientDoc.ref, { balance: recipientNewBalance }, { merge: true });
      console.log("Balance del destinatario actualizado.");
    } catch (error) {
      console.error("Error al actualizar el balance del destinatario:", error);
      setError("Hubo un error al actualizar el balance del destinatario.");
      throw error; // Volvemos a lanzar el error para que la función principal lo capture
    }
  };

  const handleTransaction = async (cardDoc) => {
    try {
      let newBalance = cardDoc.data().balance;
  
      if (transactionType === "Transferencia") {
        if (recipientEmail === currentUser.email) {
          setError("No puedes enviarte dinero a ti mismo.");
          return false;
        }
  
        // Verificar que la cuenta del destinatario exista en la colección "accounts"
        const recipientAccountQuery = query(collection(db, "accounts"), where("email", "==", recipientEmail));
        const recipientAccountDocs = await getDocs(recipientAccountQuery);
  
        if (recipientAccountDocs.empty) {
          setError("No se pudo encontrar la cuenta del destinatario.");
          return false;
        }
  
        const recipientAccountDoc = recipientAccountDocs.docs[0];
        const recipientOwnerId = recipientAccountDoc.data().ownerId;
  
        // Verificar que la tarjeta del destinatario exista en la colección "cards"
        const recipientCardQuery = query(collection(db, "cards"), where("ownerId", "==", recipientOwnerId));
        const recipientCardDocs = await getDocs(recipientCardQuery);
  
        if (recipientCardDocs.empty) {
          setError("No se pudo encontrar la tarjeta del destinatario.");
          return false;
        }
  
        const recipientCardDoc = recipientCardDocs.docs[0];
  
        if (newBalance < amount) {
          setError("No tienes suficiente balance para realizar esta transferencia.");
          return false;
        }
  
        // Restar el monto del balance del remitente
        newBalance -= parseFloat(amount);
  
        // Actualizar el balance del destinatario
        await updateRecipientBalance(recipientCardDoc, amount);
  
        // Guardar la información en la colección de "transfers"
        const transferData = {
          transfer_id: `transfer_${Date.now()}`,
          from_card_id: cardDoc.id,
          to_card_id: recipientCardDoc.id,
          amount: parseFloat(amount),
          transfer_date: new Date(),
          description: description || "Sin descripción",
        };
  
        await saveTransfer(transferData);
  
        // Guardar la transacción para el remitente
        const senderTransactionData = {
          transaction_id: `transaction_${Date.now()}`,
          card_id: cardDoc.id,
          transaction_type: transactionType,
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: description || "Sin descripción",
          status: "sent",
        };
  
        await saveTransaction(senderTransactionData);
  
        // Guardar la transacción para el destinatario
        const recipientTransactionData = {
          transaction_id: `transaction_${Date.now() + 1}`, // Asegurarse de que la ID sea única
          card_id: recipientCardDoc.id,
          transaction_type: transactionType,
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: description || "Sin descripción",
          status: "received",
        };
  
        await saveTransaction(recipientTransactionData);
  
      } else {
        // Manejo de otros tipos de transacciones (Depósito o Retiro)
        if (transactionType === "Deposito") {
          newBalance += parseFloat(amount);
        } else if (transactionType === "Retiro") {
          if (newBalance < amount) {
            setError("No tienes suficiente balance para realizar este retiro.");
            return false;
          }
          newBalance -= parseFloat(amount);
        }
  
        // Guardar la transacción en la colección "transactions"
        const transactionData = {
          transaction_id: `transaction_${Date.now()}`,
          card_id: cardDoc.id,
          transaction_type: transactionType,
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: description || "Sin descripción",
          status: transactionType === "Deposito" ? "received" : "sent",
        };
  
        await saveTransaction(transactionData);
  
        // Actualizar el balance del usuario en la colección "cards"
        await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
        console.log("Balance del usuario actualizado.");
        
        // Actualizar el balance en el componente Profile
        updateBalance(newBalance);
      }
  
      setSuccess("Transacción realizada con éxito.");
      return true;
    } catch (error) {
      console.error("Error al manejar la transacción:", error);
      setError("Hubo un error al realizar la transacción.");
      throw error;
    }
  };
  

  const saveTransaction = async (transactionData) => {
    try {
      const transactionsCollection = collection(db, "transactions");
      const transactionDocRef = doc(transactionsCollection, transactionData.transaction_id);

      await setDoc(transactionDocRef, transactionData);
      console.log("Transacción guardada con éxito.");
      
    } catch (error) {
      console.error("Error al guardar la transacción:", error);
      setError("Hubo un error al guardar la transacción.");
      throw error;
    }
  };

  const saveTransfer = async (transferData) => {
    try {
      const transfersCollection = collection(db, "transfers");
      const transferDocRef = doc(transfersCollection, transferData.transfer_id);

      await setDoc(transferDocRef, transferData);
      console.log("Transferencia guardada con éxito.");
      
    } catch (error) {
      console.error("Error al guardar la transferencia:", error);
      setError("Hubo un error al guardar la transferencia.");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Por favor, ingresa un monto válido.");
      return;
    }

    try {
      const cardDoc = await getCardDoc();
      if (!cardDoc) return; // Si no se obtiene el documento, se termina la ejecución

      const datos = await handleTransaction(cardDoc);
      if (datos) {
        setSuccess("Transacción realizada con éxito.");
      }
      
    } catch (error) {
      console.error("Error en el proceso de la transacción:", error);
      setError("Hubo un error en el proceso de la transacción.");
    }
  };

  return (
    <Container className="text-center mt-5">
      <h1>Transacciones</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>Selecciona el tipo de transferencia</Form.Label>
          <Col sm={8}>
            <Form.Select
              id="transactionType"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="Deposito">Depósito</option>
              <option value="Retiro">Retiro</option>
              <option value="Transferencia">Transferencia</option>
            </Form.Select>
          </Col>
        </Form.Group>
        {transactionType === "Transferencia" && (
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>Correo electrónico del destinatario</Form.Label>
            <Col sm={8}>
              <Form.Control
                type="email"
                id="recipientEmail"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </Col>
          </Form.Group>
        )}
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>Monto</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm={4}>Descripción</Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Button variant="primary" type="submit">Realizar Transacción</Button>
      </Form>
    </Container>
  );
};
