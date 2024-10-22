// src/api/cardApi.js
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Genera un número CLABE basado en el timestamp y números aleatorios.
 * @returns {string} - Número CLABE generado.
 */
export const generateClabeNumber = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-10); // Últimos 10 dígitos del timestamp
  const randomNumbers = Math.floor(1000000000 + Math.random() * 9000000000); // Generar 10 dígitos aleatorios
  return `${timestamp}${randomNumbers}`;
};

/**
 * Valida si el número de tarjeta ya existe en la base de datos.
 * @param {string} cardNumber - Número de tarjeta a validar.
 * @returns {Promise<boolean>} - Devuelve true si el número de tarjeta ya existe.
 */
export const isCardNumberExists = async (cardNumber) => {
  const db = getFirestore(app);
  const cardsQuery = query(
    collection(db, "cards"),
    where("cardNumber", "==", cardNumber)
  );
  const querySnapshot = await getDocs(cardsQuery);
  return !querySnapshot.empty; // Devuelve true si la tarjeta ya existe
};

/**
 * Guarda una tarjeta de crédito en Firestore.
 * @param {Object} cardData - Datos de la tarjeta a guardar.
 * @returns {Promise<void>}
 */
export const saveCreditCard = async (cardData) => {
  const db = getFirestore(app);
  const cardsCollection = collection(db, "cards");
  const cardDocRef = doc(cardsCollection, cardData.cardId);
  await setDoc(cardDocRef, cardData);
};
