import { saveTransaction, saveTransfer, updateRecipientBalance,getPhoneNumberByOwnerId } from './firestoreTransactionService';
import { getFirestore, query, collection, where, getDocs, setDoc, addDoc, doc, getDoc, getCountFromServer } from 'firebase/firestore';

import axios from 'axios'; // Asegúrate de tener axios instalado 
const db = getFirestore();
const sendMessage = async (phoneNumber, amount) => {
    try {
      await axios.post("https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/twilio-package/send-message", {
        to: phoneNumber,
        body: `Has recibido una transferencia de ${amount} MXN.`,
      });
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };
  
  export const handleTransaction = async (cardDoc, transactionType, amount, description, recipientEmail, recipientClabe, currentUser, updateBalance) => {
    let newBalance = cardDoc.data().balance;
  
    if (transactionType === "Transferencia") {
      if (recipientEmail === currentUser.email || recipientClabe === currentUser.email) {
        throw new Error("No puedes enviarte dinero a ti mismo.");
      }
  
      let recipientCardDoc;
      if (recipientClabe) {
        // Buscar tarjeta por clabeNumber
        recipientCardDoc = await getCardDocByClabe(recipientClabe);
      } else if (recipientEmail) {
        // Buscar tarjeta por correo electrónico
        recipientCardDoc = await getCardDocByEmail(recipientEmail);
      } else {
        throw new Error("Debes ingresar un correo electrónico o un número CLABE del destinatario.");
      }
  
      try {
        if (newBalance < amount) throw new Error("No tienes suficiente saldo para realizar esta transferencia.");
         // Obtener el número de teléfono del destinatario y enviar el mensaje
         const recipientOwnerId = recipientCardDoc.data().ownerId;
        newBalance -= parseFloat(amount);
  
        await updateRecipientBalance(recipientCardDoc, amount);
        await saveTransferData(cardDoc, recipientCardDoc, amount, description, recipientOwnerId);
        await saveTransactionData(cardDoc, recipientCardDoc, amount, description, transactionType);
  
        await setDoc(cardDoc.ref, { balance: newBalance }, { merge: true });
        updateBalance(newBalance);
  
       
        const recipientPhoneNumber = await getPhoneNumberByOwnerId(recipientOwnerId);
        await sendMessage(recipientPhoneNumber, amount);

        

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

const saveTransferData = async (cardDoc, recipientCardDoc, amount, description, recipientOwnerId) => {
  const transferID = `transfer_${Date.now()}`;
    await saveTransfer({
        transfer_id: transferID,
        from_card_id: cardDoc.id,
        to_card_id: recipientCardDoc.id,
        amount: parseFloat(amount),
        transfer_date: new Date(),
        description: description || "Sin descripción",
    });
    // CODIGO PARA LA NOTIFICACION:
    await saveNotification({
      notificationId: `notification_${Date.now()}`,
      transfer_id: transferID,
      ownerId: recipientOwnerId,
      message: `Has recibido una transferencia de $${amount} MXN.`,
      cardId: recipientCardDoc.id,
      read: false, // Estado inicial como no leído
      timestamp: new Date(),
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

const getCardDocByClabe = async (clabeNumber) => {
    // Primero, buscamos la tarjeta asociada al número CLABE en la colección 'cards'
    const cardsRef = collection(db, "cards");
    const q = query(cardsRef, where("clabeNumber", "==", clabeNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        throw new Error("No se encontró una tarjeta asociada a este número CLABE.");
    }

    // Devolvemos el primer documento encontrado
    return querySnapshot.docs[0];
};

const getCardDocByEmail = async (email) => {
    // Primero, obtenemos el 'ownerId' asociado al correo electrónico del destinatario desde la colección 'accounts'
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("email", "==", email));
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
export const saveNotification = async (notification) => {
  const notificationRef = collection(db, "notifications");
  await addDoc(notificationRef, notification);
};


export const markNotificationAsRead = async (notificationId) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await setDoc(notificationRef, { read: true }, { merge: true });
};

export const getNotificationById = async (notificationId) => {
  const notificationRef = doc(db, "notifications", notificationId);
  const notificationDoc = await getDoc(notificationRef);
  
  if (!notificationDoc.exists()) {
    throw new Error("La notificación no existe.");
  }

  return notificationDoc.data();
};

export const countUnreadNotifications = async (currentUser, db) => {
  if (currentUser) {
    const q = query(
      collection(db, "notifications"),
      where("ownerId", "==", currentUser.uid),
      where("read", "==", false)
    );

    try {
      const snapshot = await getCountFromServer(q); // Obtener solo el conteo de los documentos
      return snapshot.data().count; // Retornar el número de documentos
    } catch (error) {
      console.error("Error al contar notificaciones no leídas:", error);
      return 0; // En caso de error, retornar 0
    }
  }
  return 0; // Si no hay usuario, no hay notificaciones
};

export const getTransferById = async (transferId) => {
  const transferRef = doc(db, "transfers", transferId);
  const transferDoc = await getDoc(transferRef);
  
  if (!transferDoc.exists()) {
    throw new Error("Transferencia no encontrada");
  }
  
  return transferDoc.data();
};
export const getCardById = async (cardId) => {
  const cardRef = doc(db, "cards", cardId);
  const cardDoc = await getDoc(cardRef);

  if (!cardDoc.exists()) {
    throw new Error("Tarjeta no encontrada.");
  }

  const cardData = cardDoc.data();
  
  // Aquí transformamos el número de tarjeta
  const maskedCardNumber = maskCardNumber(cardData.cardNumber);
  
  // Devolvemos solo el cardNumber enmascarado
  return {
    cardNumber: maskedCardNumber
  };
};

// Función para enmascarar el número de tarjeta
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 8) {
    return "Número inválido";
  }
  const firstDigit = cardNumber.slice(0, 1); // Primer dígito
  const lastFourDigits = cardNumber.slice(-4); // Últimos 4 dígitos
  const masked = `${firstDigit}${'x'.repeat(cardNumber.length - 5)}${lastFourDigits}`;
  return masked;
};
