// src/api/qrApi.js
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Verifica si la tarjeta pertenece al usuario y tiene suficiente saldo.
 * @param {string} cardId - ID de la tarjeta.
 * @param {string} userId - ID del usuario.
 * @param {number} amount - Monto a validar.
 * @returns {Promise<Object>} - Datos de la tarjeta si es válida.
 */
export const verifyCardOwnershipAndBalance = async (cardId, userId, amount) => {
  const db = getFirestore(app);
  const cardDocRef = doc(db, "cards", cardId);
  const cardDoc = await getDoc(cardDocRef);

  if (!cardDoc.exists()) {
    throw new Error("Tarjeta no encontrada.");
  }

  const cardData = cardDoc.data();

  if (cardData.ownerId !== userId) {
    throw new Error("No tienes permiso para generar un código QR para esta tarjeta.");
  }

  if (cardData.balance < amount) {
    throw new Error("No tienes suficiente saldo para generar el código QR.");
  }

  return cardData;
};

/**
 * Guarda la información del código QR en Firestore.
 * @param {Object} qrData - Datos del código QR.
 * @returns {Promise<void>}
 */
export const saveQrCode = async (qrData) => {
  const db = getFirestore(app);
  const qrDocRef = doc(db, "qr_codes", qrData.transactionId);
  await setDoc(qrDocRef, qrData);
};
