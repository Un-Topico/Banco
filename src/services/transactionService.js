import { saveTransaction, saveTransfer, updateRecipientBalance } from './firestoreTransactionService';
import { getFirestore, query, collection, where, getDocs,setDoc } from 'firebase/firestore';

const db = getFirestore();

export const handleTransaction = async (cardDoc, transactionType, amount, description, recipientEmail, currentUser, updateBalance) => {
    let newBalance = cardDoc.data().balance;
    if (transactionType === "Transferencia") {
        console.log("Hola ",currentUser.email)
      if (recipientEmail === currentUser.email) throw new Error("No puedes enviarte dinero a ti mismo.");
      console.log('Recipient Email:', recipientEmail);
      
      try {
        console.log(recipientEmail)
        const recipientCardDoc = await findRecipientCard(recipientEmail);
        console.log('Recipient Card Doc:', recipientCardDoc);
        
        if (newBalance < amount) throw new Error("No tienes suficiente saldo para realizar esta transferencia.");
  
        newBalance -= parseFloat(amount);
  
        await updateRecipientBalance(recipientCardDoc, amount);
        await saveTransferData(cardDoc, recipientCardDoc, amount, description);
        await saveTransactionData(cardDoc, recipientCardDoc, amount, description, transactionType);
  
        await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
        updateBalance(newBalance);
      } catch (error) {
        console.error('Error in handleTransaction:', error.message);
        throw error;
      }
    } else {
      newBalance = transactionType === "Deposito" ? newBalance + parseFloat(amount) : newBalance - parseFloat(amount);
  
      await saveTransaction({
        transaction_id: `transaction_${Date.now()}`,
        card_id: cardDoc.id,
        transaction_type: transactionType,
        amount: parseFloat(amount),
        transaction_date: new Date(),
        description: description || "Sin descripción",
        status: transactionType === "Deposito" ? "received" : "sent",
      });
  
      await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
      updateBalance(newBalance);
    }
  };
  
  const findRecipientCard = async (recipientEmail) => {
    // Primero, obtenemos el 'ownerId' asociado al correo electrónico del destinatario desde la colección 'accounts'
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("email", "==", recipientEmail));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error("No se encontró una cuenta asociada a este correo electrónico.");
    }
  
    const recipientAccount = querySnapshot.docs[0].data();
    const recipientOwnerId = recipientAccount.ownerId;
  
    // Luego, buscamos la tarjeta asociada al 'ownerId' en la colección 'cards'
    const cardsRef = collection(db, "cards");
    const cardQuery = query(cardsRef, where("ownerId", "==", recipientOwnerId));
    const cardSnapshot = await getDocs(cardQuery);
  
    if (cardSnapshot.empty) {
      throw new Error("El destinatario no tiene una tarjeta asociada.");
    }
  
    // Devolvemos el primer documento encontrado
    return cardSnapshot.docs[0];
  };
  

const saveTransferData = async (cardDoc, recipientCardDoc, amount, description) => {
  await saveTransfer({
    transfer_id: `transfer_${Date.now()}`,
    from_card_id: cardDoc.id,
    to_card_id: recipientCardDoc.id,
    amount: parseFloat(amount),
    transfer_date: new Date(),
    description: description || "Sin descripción",
  });
};

const saveTransactionData = async (cardDoc, recipientCardDoc, amount, description, transactionType) => {
  const now = Date.now();
  await saveTransaction({
    transaction_id: `transaction_${now}`,
    card_id: cardDoc.id,
    transaction_type: transactionType,
    amount: parseFloat(amount),
    transaction_date: new Date(),
    description: description || "Sin descripción",
    status: "sent",
  });

  await saveTransaction({
    transaction_id: `transaction_${now + 1}`,
    card_id: recipientCardDoc.id,
    transaction_type: transactionType,
    amount: parseFloat(amount),
    transaction_date: new Date(),
    description: description || "Sin descripción",
    status: "received",
  });
};
