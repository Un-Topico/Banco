import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Obtiene las tarjetas del usuario autenticado desde Firestore.
 * @param {string} userId - ID del usuario autenticado.
 * @returns {Promise<Array>} - Lista de tarjetas del usuario.
 */
export const fetchUserCards = async (userId) => {
  const db = getFirestore(app);
  const cardsCollection = collection(db, "cards");
  const q = query(cardsCollection, where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);

  // Solo devolver los campos necesarios
  const userCards = querySnapshot.docs.map((doc) => ({
    cardNumber: doc.data().cardNumber,
    balance: doc.data().balance,
    cardId: doc.id, // Necesitamos el ID de la tarjeta
  }));

  return userCards;
};
