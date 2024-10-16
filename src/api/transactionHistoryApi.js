import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Escucha las transacciones de una tarjeta específica en tiempo real y aplica los filtros seleccionados.
 * @param {string} selectedCardId - El ID de la tarjeta seleccionada.
 * @param {string} filter - El filtro seleccionado (por estado de la transacción).
 * @param {string} startDate - Fecha de inicio para filtrar las transacciones.
 * @param {string} endDate - Fecha de fin para filtrar las transacciones.
 * @param {function} onSuccess - Función a ejecutar cuando se obtienen las transacciones con éxito.
 * @param {function} onError - Función a ejecutar cuando ocurre un error al obtener las transacciones.
 * @returns {function} - Función para desuscribirse de la escucha en tiempo real.
 */
export const listenToTransactions = (selectedCardId, filter, startDate, endDate, onSuccess, onError) => {
  const db = getFirestore(app);

  let q = query(
    collection(db, "transactions"),
    where("card_id", "==", selectedCardId)
  );

  if (filter !== "all") {
    q = query(q, where("status", "==", filter));
  }

  if (startDate && endDate) {
    q = query(
      q,
      where("transaction_date", ">=", new Date(startDate)),
      where("transaction_date", "<=", new Date(endDate))
    );
  }

  // Ordenar las transacciones por fecha de forma descendente
  q = query(q, orderBy("transaction_date", "desc"));

  // Escuchar las transacciones en tiempo real
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const transactionsData = [];
      querySnapshot.forEach((doc) => {
        transactionsData.push({ ...doc.data(), id: doc.id });
      });

      onSuccess(transactionsData);
    },
    (error) => {
      onError(error);
    }
  );

  return unsubscribe;
};
