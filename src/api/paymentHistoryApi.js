import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Obtiene las tarjetas del usuario.
 * @param {string} userId - ID del usuario actual.
 * @returns {Promise<Array>} - Lista de tarjetas del usuario.
 */
export const getUserCards = async (userId) => {
  const db = getFirestore(app);
  const cardsRef = collection(db, "cards");
  const cardsQuery = query(cardsRef, where("ownerId", "==", userId));
  const cardsSnapshot = await getDocs(cardsQuery);

  return cardsSnapshot.docs.map((doc) => ({
    cardId: doc.id,
    ...doc.data(),
  }));
};

/**
 * Obtiene el historial de compras y pagos de servicios para una tarjeta específica.
 * @param {string} cardId - ID de la tarjeta seleccionada.
 * @returns {Promise<Array>} - Lista de transacciones combinadas.
 */
export const getPurchaseHistory = async (cardId) => {
  const db = getFirestore(app);
  const transactionsRef = collection(db, "transactions");

  // Consulta para "compraEnLinea"
  const purchaseQuery = query(
    transactionsRef,
    where("transaction_type", "==", "compraEnLinea"),
    where("card_id", "==", cardId)
  );
  const purchaseSnapshot = await getDocs(purchaseQuery);
  const purchasesData = purchaseSnapshot.docs.map((doc) => doc.data());

  // Consulta para "pagoServicio"
  const servicePaymentQuery = query(
    transactionsRef,
    where("transaction_type", "==", "pagoServicio"),
    where("card_id", "==", cardId)
  );
  const servicePaymentSnapshot = await getDocs(servicePaymentQuery);
  const servicePaymentsData = servicePaymentSnapshot.docs.map((doc) => doc.data());

  // Combinar y ordenar las transacciones
  const combinedTransactions = [...purchasesData, ...servicePaymentsData];
  combinedTransactions.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());

  return combinedTransactions;
};
