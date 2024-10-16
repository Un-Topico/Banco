// src/api/cardApi.js
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Actualiza los datos de una tarjeta en Firestore.
 * @param {string} cardId - ID de la tarjeta a actualizar.
 * @param {Object} cardData - Nuevos datos de la tarjeta.
 * @returns {Promise<void>}
 */
export const updateCreditCard = async (cardId, cardData) => {
  const db = getFirestore(app);
  const cardDocRef = doc(db, "cards", cardId);

  await updateDoc(cardDocRef, {
    ...cardData,
    updatedAt: new Date(),
  });
};

/**
 * Valida el número de tarjeta usando el algoritmo de Luhn.
 * @param {string} number - Número de tarjeta a validar.
 * @returns {boolean} - True si el número de tarjeta es válido.
 */
export const validateLuhn = (number) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};
