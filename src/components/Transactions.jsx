import React, { useState } from "react";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";

export const Transactions = ({ updateBalance }) => {
  const [transactionType, setTransactionType] = useState('Deposito');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(''); // Correo del destinatario
  const { currentUser } = useAuth();
  
  const db = getFirestore(app);

  const getAccountDoc = async () => {
    try {
      const accountId = `account_${currentUser.uid}`;
      console.log("Account ID:", accountId);

      const accountDocRef = doc(db, "accounts", accountId);
      const accountDoc = await getDoc(accountDocRef);
      console.log("Account Document:", accountDoc);

      if (!accountDoc.exists()) {
        console.log("El documento de la cuenta no existe.");
        alert("La cuenta del usuario no existe.");
        return null;
      }
      return accountDoc;
    } catch (error) {
      console.error("Error al obtener el documento de la cuenta:", error);
      alert("Hubo un error al obtener la cuenta.");
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
      alert("Hubo un error al actualizar el balance del destinatario.");
      throw error; // Volvemos a lanzar el error para que la función principal lo capture
    }
  };

  const handleTransaction = async (accountDoc) => {
    try {
      let newBalance = accountDoc.data().balance;

      if (transactionType === "Transferencia") {
        if (recipientEmail === currentUser.email) {
          alert("No puedes enviarte dinero a ti mismo.");
          return false;
        }

        // Verificar que la cuenta de destino exista
        const recipientQuery = query(collection(db, "accounts"), where("email", "==", recipientEmail));
        const recipientDocs = await getDocs(recipientQuery);

        if (recipientDocs.empty) {
          alert("No se pudo encontrar el destinatario.");
          return false;
        }

        const recipientDoc = recipientDocs.docs[0];

        if (newBalance < amount) {
          alert("No tienes suficiente balance para realizar esta transferencia.");
          return false;
        }

        // Restar el monto del balance del remitente
        newBalance -= parseFloat(amount);

        // Actualizar el balance del destinatario
        await updateRecipientBalance(recipientDoc, amount);

        // Guardar la información en la colección de "transfers"
        const transferData = {
          transfer_id: `transfer_${Date.now()}`,
          from_account_id: accountDoc.id,
          to_account_id: recipientDoc.id,
          amount: parseFloat(amount),
          transfer_date: new Date(),
          description: description || "Sin descripción",
        };

        await saveTransfer(transferData);

        // Guardar la transacción para el remitente
        const senderTransactionData = {
          transaction_id: `transaction_${Date.now()}`,
          account_id: accountDoc.id,
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
          account_id: recipientDoc.id,
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
            alert("No tienes suficiente balance para realizar este retiro.");
            return false;
          }
          newBalance -= parseFloat(amount);
        }

        // Guardar la transacción en la colección "transactions"
        const transactionData = {
          transaction_id: `transaction_${Date.now()}`,
          account_id: accountDoc.id,
          transaction_type: transactionType,
          amount: parseFloat(amount),
          transaction_date: new Date(),
          description: description || "Sin descripción",
          status: transactionType === "Deposito" ? "received" : "sent",
        };

        await saveTransaction(transactionData);

        // Actualizar el balance del usuario en la colección "accounts"
        await setDoc(accountDoc.ref, { balance: newBalance }, { merge: true });
        console.log("Balance del usuario actualizado.");
        
        // Actualizar el balance en el componente Profile
        updateBalance(newBalance);
      }

      return true;
    } catch (error) {
      console.error("Error al manejar la transacción:", error);
      alert("Hubo un error al realizar la transacción.");
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
      alert("Hubo un error al guardar la transacción.");
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
      alert("Hubo un error al guardar la transferencia.");
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Por favor, ingresa un monto válido.");
      return;
    }

    try {
      const accountDoc = await getAccountDoc();
      if (!accountDoc) return; // Si no se obtiene el documento, se termina la ejecución

      const datos = await handleTransaction(accountDoc);
      if (datos) {
        alert("Transacción realizada con éxito.");
      }
      
    } catch (error) {
      console.error("Error en el proceso de la transacción:", error);
      alert("Hubo un error en el proceso de la transacción.");
    }
  };

  return (
    <div className="container text-center">
      <h1>Transacciones</h1>
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
        <button type="submit">Realizar transacción</button>
      </form>
    </div>
  );
};
