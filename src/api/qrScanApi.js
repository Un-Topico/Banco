// src/api/qrScanApi.js
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Verifica si el QR ya fue usado y obtiene sus datos.
 * @param {string} qrCodeData - ID del código QR.
 * @returns {Promise<Object>} - Datos del código QR si es válido.
 * @throws {Error} - Si el QR no es válido o ya fue usado.
 */
export const verifyQrCode = async (qrCodeData) => {
  const db = getFirestore(app);
  const qrDocRef = doc(db, 'qr_codes', qrCodeData);
  const qrDoc = await getDoc(qrDocRef);

  if (!qrDoc.exists()) {
    throw new Error('El código QR no es válido.');
  }

  const qrData = qrDoc.data();
  if (qrData.used) {
    throw new Error('El código QR ya fue utilizado.');
  }

  return qrData;
};

/**
 * Verifica si la tarjeta tiene saldo suficiente.
 * @param {string} cardId - ID de la tarjeta.
 * @param {number} amount - Monto a verificar.
 * @returns {Promise<Object>} - Datos de la tarjeta.
 * @throws {Error} - Si no tiene suficiente saldo.
 */
export const verifyCardBalance = async (cardId, amount) => {
  const db = getFirestore(app);
  const cardDocRef = doc(db, 'cards', cardId);
  const cardDoc = await getDoc(cardDocRef);

  if (!cardDoc.exists()) {
    throw new Error('Tarjeta no encontrada.');
  }

  const cardData = cardDoc.data();
  if (cardData.balance < amount) {
    throw new Error('El usuario no tiene suficiente saldo.');
  }

  return cardData;
};

/**
 * Obtiene las tarjetas del usuario autenticado desde Firestore.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<Array>} - Lista de tarjetas del usuario.
 */
export const getUserCards = async (userId) => {
  const db = getFirestore(app);
  const cardsQuery = query(
    collection(db, 'cards'),
    where('ownerId', '==', userId)
  );
  const cardsSnapshot = await getDocs(cardsQuery);
  const cardsData = cardsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return cardsData;
};

/**
 * Actualiza el saldo de una tarjeta.
 * @param {string} cardId - ID de la tarjeta.
 * @param {number} newBalance - Nuevo saldo de la tarjeta.
 * @returns {Promise<void>}
 */
export const updateCardBalance = async (cardId, newBalance) => {
  const db = getFirestore(app);
  const cardDocRef = doc(db, 'cards', cardId);
  await updateDoc(cardDocRef, { balance: newBalance });
};

/**
 * Marca un código QR como usado.
 * @param {string} qrCodeData - ID del código QR.
 * @returns {Promise<void>}
 */
export const markQrCodeAsUsed = async (qrCodeData) => {
  const db = getFirestore(app);
  const qrDocRef = doc(db, 'qr_codes', qrCodeData);
  await updateDoc(qrDocRef, { used: true });
};

/**
 * Guarda una transacción en Firestore.
 * @param {Object} transactionData - Datos de la transacción.
 * @returns {Promise<void>}
 */
export const saveTransaction = async (transactionData) => {
  const db = getFirestore(app);
  await addDoc(collection(db, 'transactions'), transactionData);
};
