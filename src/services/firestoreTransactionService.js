import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc, 
} from 'firebase/firestore';
import { app } from '../firebaseConfig';

const db = getFirestore(app);

export const getPhoneNumberByOwnerId = async (ownerId) => {
  try {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No se encontró una cuenta asociada a este ownerId.');
    }

    const accountDoc = querySnapshot.docs[0].data();
    return accountDoc.phoneNumber;
  } catch (error) {
    console.error('Error al obtener el número de teléfono:', error.message);
    throw error;
  }
};

export const getCardDoc = async (selectedCardId) => {
  if (!selectedCardId) throw new Error('No se ha seleccionado ninguna tarjeta.');

  const cardDocRef = doc(db, 'cards', selectedCardId);
  const cardDoc = await getDoc(cardDocRef);

  if (!cardDoc.exists()) throw new Error('La tarjeta seleccionada no existe.');

  return cardDoc;
};

export const listenToCardDoc = (cardId, onBalanceUpdate) => {
  const cardDocRef = doc(db, 'cards', cardId);
  return onSnapshot(cardDocRef, (doc) => {
    const data = doc.data();
    if (data) {
      onBalanceUpdate(data.balance);
    }
  });
};

export const updateRecipientBalance = async (recipientDoc, amount) => {
  const recipientData = recipientDoc.data();
  const recipientNewBalance = recipientData.balance + parseFloat(amount);
  await setDoc(recipientDoc.ref, { balance: recipientNewBalance }, { merge: true });
};

export const saveTransaction = async (transactionData) => {
  const transactionsCollection = collection(db, 'transactions');
  const transactionDocRef = doc(transactionsCollection, transactionData.transaction_id);
  await setDoc(transactionDocRef, transactionData);
};

export const saveTransfer = async (transferData) => {
  const transfersCollection = collection(db, 'transfers');
  const transferDocRef = doc(transfersCollection, transferData.transfer_id);
  await setDoc(transferDocRef, transferData);
};

export const fetchContacts = async (userId) => {
  const contactsQuery = query(
    collection(db, 'contactos'),
    where('userId', '==', userId)
  );
  const contactsSnapshot = await getDocs(contactsQuery);
  return contactsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const saveContact = async (userId, email, alias) => {
  const contactData = {
    userId,
    email,
    alias,
    created_at: new Date(),
  };
  const contactsCollection = collection(db, 'contactos');
  const contactDocRef = doc(contactsCollection, `contact_${Date.now()}`);
  await setDoc(contactDocRef, contactData);
};

export const saveNotification = async (notification) => {
  const notificationRef = collection(db, 'notifications');
  await addDoc(notificationRef, notification);
};

export const markNotificationAsRead = async (notificationId) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await setDoc(notificationRef, { read: true }, { merge: true });
};

export const getNotificationById = async (notificationId) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  const notificationDoc = await getDoc(notificationRef);

  if (!notificationDoc.exists()) {
    throw new Error('La notificación no existe.');
  }

  return notificationDoc.data();
};

export const getTransferById = async (transferId) => {
  const transferRef = doc(db, 'transfers', transferId);
  const transferDoc = await getDoc(transferRef);

  if (!transferDoc.exists()) {
    throw new Error('Transferencia no encontrada');
  }

  return transferDoc.data();
};

export const getCardById = async (cardId) => {
  const cardRef = doc(db, 'cards', cardId);
  const cardDoc = await getDoc(cardRef);

  if (!cardDoc.exists()) {
    throw new Error('Tarjeta no encontrada.');
  }

  const cardData = cardDoc.data();

  // Enmascaramos el número de tarjeta
  const maskedCardNumber = maskCardNumber(cardData.cardNumber);

  return {
    cardNumber: maskedCardNumber,
  };
};

// Función para enmascarar el número de tarjeta
const maskCardNumber = (cardNumber) => {
  if (!cardNumber || cardNumber.length < 8) {
    return 'Número inválido';
  }
  const firstDigit = cardNumber.slice(0, 1);
  const lastFourDigits = cardNumber.slice(-4);
  const masked = `${firstDigit}${'x'.repeat(cardNumber.length - 5)}${lastFourDigits}`;
  return masked;
};
