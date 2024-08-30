import React, { useState } from "react";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";

export const Transactions = () => {
  const [transactionType, setTransactionType] = useState('Deposito');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(''); // Correo de la cuenta de destino para Transferencia
  const { currentUser } = useAuth();
  
  const db = getFirestore(app);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa un monto válido.");
      return;
    }

    try {
      const accountId = `account_${currentUser.uid}`; // Supongo que ya tienes el accountId del usuario
      const accountDocRef = doc(db, "accounts", accountId);
      const accountDoc = await getDoc(accountDocRef);

      if (!accountDoc.exists()) {
        alert("La cuenta del usuario no existe.");
        return;
      }

      const accountData = accountDoc.data();
      let newBalance = accountData.balance;

      // Verificar si es una Transferencia
      if (transactionType === "Transferencia") {
        if (recipientEmail === currentUser.email) {
          alert("No puedes enviarte dinero a ti mismo.");
          return;
        }

        // Verificar que la cuenta de destino exista
        const recipientQuery = query(collection(db, "accounts"), where("email", "==", recipientEmail));
        const recipientDocs = await getDocs(recipientQuery);

        if (recipientDocs.empty) {
          alert("La cuenta de destino no existe.");
          return;
        }

        const recipientDoc = recipientDocs.docs[0];
        const recipientData = recipientDoc.data();

        // Verificar que el monto no exceda el balance
        if (newBalance < amount) {
          alert("No tienes suficiente balance para realizar esta transferencia.");
          return;
        }

        // Restar el monto del balance del remitente
        newBalance -= parseFloat(amount);

        // Agregar el monto al balance del destinatario
        const recipientNewBalance = recipientData.balance + parseFloat(amount);
        await setDoc(recipientDoc.ref, { balance: recipientNewBalance }, { merge: true });
      } else if (transactionType === "Retiro") {
        // Verificar que el monto no exceda el balance en caso de Retiro
        if (newBalance < amount) {
          alert("No tienes suficiente balance para realizar este retiro.");
          return;
        }
        newBalance -= parseFloat(amount);
      } else if (transactionType === "Deposito") {
        // Para depósitos, solo sumamos el monto al balance
        newBalance += parseFloat(amount);
      }

      // Actualizar el balance del usuario en la colección "accounts"
      await setDoc(accountDocRef, { balance: newBalance }, { merge: true });

      // Guardar la transacción en la colección "transactions"
      const transactionId = `transaction_${Date.now()}`;
      const transactionData = {
        transaction_id: transactionId,
        account_id: accountId,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        transaction_date: new Date(),
        description: description || "Sin descripción",
        recipient_email: transactionType === "Transferencia" ? recipientEmail : null, // Guardar el correo del destinatario
      };

      const transactionsCollection = collection(db, "transactions");
      const transactionDocRef = doc(transactionsCollection, transactionId);

      await setDoc(transactionDocRef, transactionData);
      alert("Transacción realizada con éxito.");
    } catch (error) {
      console.error("Error al realizar la transacción:", error);
      alert("Hubo un error al realizar la transacción.");
    }
  };

  return (
    <div className="container text-center">
      <h1>Transferencia</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="transactionType">Selecciona el tipo de transferencia</label>
          <select
            id="transactionType"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="Deposito">Depósito</option>
            <option value="Retiro">Retiro</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        {transactionType === "Transferencia" && (
          <div>
            <label htmlFor="recipientEmail">Correo electrónico del destinatario</label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="amount">Monto</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Descripción</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Realizar Transacción</button>
      </form>
    </div>
  );
};
