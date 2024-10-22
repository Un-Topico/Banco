import { getFirestore, doc, getDoc, runTransaction, collection, } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Procesa el pago de un servicio.
 * @param {string} selectedService - Servicio seleccionado.
 * @param {number} paymentAmount - Monto del pago.
 * @param {string} referenceNumber - Número de referencia.
 * @param {Object} selectedCard - Tarjeta seleccionada.
 * @param {Object} currentUser - Usuario actual.
 * @returns {Promise<void>}
 */
export const processPayment = async (selectedService, paymentAmount, referenceNumber, selectedCard, currentUser) => {
  const db = getFirestore(app);

  // Validaciones en el backend
  if (!selectedService || !paymentAmount || !referenceNumber || !selectedCard) {
    throw new Error("Por favor, completa todos los campos.");
  }

  const parsedAmount = parseFloat(paymentAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error("El monto a pagar debe ser un número positivo.");
  }

  // Obtener la tarjeta actualizada desde la base de datos
  const cardRef = doc(db, "cards", selectedCard.cardId);
  const cardSnapshot = await getDoc(cardRef);
  if (!cardSnapshot.exists()) {
    throw new Error("La tarjeta seleccionada no existe.");
  }

  const cardData = cardSnapshot.data();

  // Verificar que la tarjeta pertenezca al usuario actual
  if (cardData.ownerId !== currentUser.uid) {
    throw new Error("No tienes permiso para usar esta tarjeta.");
  }

  // Verificar que el usuario tenga fondos suficientes
  if (cardData.balance < parsedAmount) {
    throw new Error("Saldo insuficiente en la tarjeta seleccionada.");
  }

  // Usar una transacción atómica para garantizar la consistencia
  await runTransaction(db, async (transaction) => {
    const cardDoc = await transaction.get(cardRef);
    const currentBalance = cardDoc.data().balance;

    if (currentBalance < parsedAmount) {
      throw new Error("Saldo insuficiente en la tarjeta seleccionada.");
    }

    const newBalance = currentBalance - parsedAmount;
    transaction.update(cardRef, { balance: newBalance });

    // Guardar la transacción del pago
    const transactionData = {
      transaction_id: `transaction_${selectedService}_${Date.now()}`,
      amount: parsedAmount,
      description: `Pago de servicio de ${selectedService}`,
      reference_number: referenceNumber,
      status: "pagado",
      transaction_type: "pagoServicio",
      category: "servicio",
      transaction_date: new Date(),
      card_id: selectedCard.cardId,
      service_type: selectedService,
      user_id: currentUser.uid, // Agregar el ID del usuario que realizó el pago
    };

    const transactionsCollection = collection(db, "transactions");
    const newTransactionRef = doc(transactionsCollection); // Genera un nuevo ID automáticamente
    transaction.set(newTransactionRef, transactionData);
  });
};
