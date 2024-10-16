// src/services/servicePaymentService.js
import { getFirestore, doc, getDoc, runTransaction, collection } from "firebase/firestore";
import { app } from "../firebaseConfig";

// Inicializa Firestore
const db = getFirestore(app);

// Función para obtener una tarjeta por ID
export const getCardById = async (cardId) => {
  const cardRef = doc(db, "cards", cardId);
  const cardSnapshot = await getDoc(cardRef);

  if (!cardSnapshot.exists()) {
    throw new Error("La tarjeta seleccionada no existe.");
  }

  return cardSnapshot.data();
};

// Función para verificar los fondos en la tarjeta
export const hasSufficientFunds = (cardBalance, amount) => {
  return cardBalance >= amount;
};

// Función para procesar el pago mediante una transacción de Firebase
export const processPaymentTransaction = async (selectedCard, parsedAmount, selectedService, referenceNumber, currentUser) => {
  const cardRef = doc(db, "cards", selectedCard.cardId);

  // Ejecuta una transacción atómica en Firebase
  await runTransaction(db, async (transaction) => {
    const cardDoc = await transaction.get(cardRef);
    const currentBalance = cardDoc.data().balance;

    if (currentBalance < parsedAmount) {
      throw new Error("Saldo insuficiente en la tarjeta seleccionada.");
    }

    const newBalance = currentBalance - parsedAmount;
    transaction.update(cardRef, { balance: newBalance });

    // Guardar la transacción de pago
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
    };

    const transactionsCollection = collection(db, "transactions");
    transaction.set(doc(transactionsCollection), transactionData);
  });
};
