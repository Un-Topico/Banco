import {
  saveTransaction,
  saveTransfer,
  updateRecipientBalance,
  getPhoneNumberByOwnerId,
  saveNotification, 
} from './firestoreTransactionService';
import {
  getFirestore,
  query,
  collection,
  where,
  getDocs,
  setDoc,
} from 'firebase/firestore';

const db = getFirestore();

const sendMessage = async (phoneNumber, amount) => {
  try {
    const response = await fetch("https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/twilio-package/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: `Has recibido una transferencia de ${amount} MXN.`,
      }),
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta de la API");
    }
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
};

export const handleTransaction = async (
  cardDoc,
  transactionType,
  amount,
  description,
  recipientEmail,
  recipientClabe,
  currentUser,
  updateBalance
) => {
  let newBalance = cardDoc.data().balance;

  if (transactionType === 'Transferencia') {
    if (recipientEmail === currentUser.email || recipientClabe === currentUser.email) {
      throw new Error('No puedes enviarte dinero a ti mismo.');
    }

    let recipientCardDoc;
    if (recipientClabe) {
      recipientCardDoc = await getCardDocByClabe(recipientClabe);
    } else if (recipientEmail) {
      recipientCardDoc = await getCardDocByEmail(recipientEmail);
    } else {
      throw new Error(
        'Debes ingresar un correo electrónico o un número CLABE del destinatario.'
      );
    }

    try {
      if (newBalance < amount)
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      newBalance -= parseFloat(amount);

      await updateRecipientBalance(recipientCardDoc, amount);
      await saveTransferData(
        cardDoc,
        recipientCardDoc,
        amount,
        description,
        recipientCardDoc.data().ownerId
      );
      await saveTransactionData(
        cardDoc,
        recipientCardDoc,
        amount,
        description,
        transactionType
      );

      await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
      updateBalance(newBalance);

      const recipientOwnerId = recipientCardDoc.data().ownerId;
      const recipientPhoneNumber = await getPhoneNumberByOwnerId(recipientOwnerId);
      await sendMessage(recipientPhoneNumber, amount);
    } catch (error) {
      console.error('Error in handleTransaction:', error.message);
      throw error;
    }
  } else {
    newBalance =
      transactionType === 'Deposito'
        ? newBalance + parseFloat(amount)
        : newBalance - parseFloat(amount);

    await saveTransaction({
      transaction_id: `transaction_${Date.now()}`,
      card_id: cardDoc.id,
      transaction_type: transactionType,
      amount: parseFloat(amount),
      transaction_date: new Date(),
      description: description || 'Sin descripción',
      status: transactionType === 'Deposito' ? 'received' : 'sent',
    });

    await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
    updateBalance(newBalance);
  }
};

const saveTransferData = async (
  cardDoc,
  recipientCardDoc,
  amount,
  description,
  recipientOwnerId
) => {
  const transferID = `transfer_${Date.now()}`;
  await saveTransfer({
    transfer_id: transferID,
    from_card_id: cardDoc.id,
    to_card_id: recipientCardDoc.id,
    amount: parseFloat(amount),
    transfer_date: new Date(),
    description: description || 'Sin descripción',
  });

  await saveNotification({
    notificationId: `notification_${Date.now()}`,
    transfer_id: transferID,
    ownerId: recipientOwnerId,
    message: `Has recibido una transferencia de $${amount} MXN.`,
    cardId: recipientCardDoc.id,
    read: false,
    timestamp: new Date(),
  });
};

const saveTransactionData = async (
  cardDoc,
  recipientCardDoc,
  amount,
  description,
  transactionType
) => {
  const now = Date.now();
  await saveTransaction({
    transaction_id: `transaction_${now}`,
    card_id: cardDoc.id,
    transaction_type: transactionType,
    amount: parseFloat(amount),
    transaction_date: new Date(),
    description: description || 'Sin descripción',
    status: 'sent',
  });

  await saveTransaction({
    transaction_id: `transaction_${now + 1}`,
    card_id: recipientCardDoc.id,
    transaction_type: transactionType,
    amount: parseFloat(amount),
    transaction_date: new Date(),
    description: description || 'Sin descripción',
    status: 'received',
  });
};

const getCardDocByClabe = async (clabeNumber) => {
  const cardsRef = collection(db, 'cards');
  const q = query(cardsRef, where('clabeNumber', '==', clabeNumber));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error('No se encontró una tarjeta asociada a este número CLABE.');
  }

  return querySnapshot.docs[0];
};

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
