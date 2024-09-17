import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs,onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);
export const getPhoneNumberByOwnerId = async (ownerId) => {
  try {
    const accountsRef = collection(db, "accounts");
    const q = query(accountsRef, where("ownerId", "==", ownerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No se encontró una cuenta asociada a este ownerId.");
    }

    const accountDoc = querySnapshot.docs[0].data();
    return accountDoc.phoneNumber;
  } catch (error) {
    console.error("Error al obtener el número de teléfono:", error.message);
    throw error;
  }
};

export const getCardDoc = async (selectedCardId) => {
  if (!selectedCardId) throw new Error("No se ha seleccionado ninguna tarjeta.");

  const cardDocRef = doc(db, "cards", selectedCardId);
  const cardDoc = await getDoc(cardDocRef);

  if (!cardDoc.exists()) throw new Error("La tarjeta seleccionada no existe.");
  
  return cardDoc;
};

export const listenToCardDoc = (cardId, onBalanceUpdate) => {
  const cardDocRef = doc(db, "cards", cardId);
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
  const transactionsCollection = collection(db, "transactions");
  const transactionDocRef = doc(transactionsCollection, transactionData.transaction_id);
  await setDoc(transactionDocRef, transactionData);
};

export const saveTransfer = async (transferData) => {
  const transfersCollection = collection(db, "transfers");
  const transferDocRef = doc(transfersCollection, transferData.transfer_id);
  await setDoc(transferDocRef, transferData);
};

export const fetchContacts = async (userId) => {
  const contactsQuery = query(collection(db, "contactos"), where("userId", "==", userId));
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
    const contactsCollection = collection(db, "contactos");
    const contactDocRef = doc(contactsCollection, `contact_${Date.now()}`);
    await setDoc(contactDocRef, contactData);
  };
  