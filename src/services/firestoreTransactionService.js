import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs,onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export const getCardDoc = async (selectedCardId) => {
  if (!selectedCardId) throw new Error("No se ha seleccionado ninguna tarjeta.");

  const cardDocRef = doc(db, "cards", selectedCardId);
  const cardDoc = await getDoc(cardDocRef);

  if (!cardDoc.exists()) throw new Error("La tarjeta seleccionada no existe.");
  
  return cardDoc;
};

export const getCardDocByClabe = async (clabeNumber) => {
  // Buscar la tarjeta asociada al número CLABE en la colección 'cards'
  const cardsRef = collection(db, "cards");
  const q = query(cardsRef, where("clabeNumber", "==", clabeNumber));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No se encontró una tarjeta asociada a este número CLABE.");
  }

  // Devolver el primer documento encontrado
  return querySnapshot.docs[0];
};

export const getCardDocByEmail = async (email) => {
  // Obtener el 'ownerId' asociado al correo electrónico del destinatario desde la colección 'accounts'
  const accountsRef = collection(db, "accounts");
  const q = query(accountsRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("No se encontró una cuenta asociada a este correo electrónico.");
  }

  const recipientAccount = querySnapshot.docs[0].data();
  const recipientOwnerId = recipientAccount.ownerId;

  // Buscar la tarjeta asociada al 'ownerId' en la colección 'cards'
  const cardsRef = collection(db, "cards");
  const cardQuery = query(cardsRef, where("ownerId", "==", recipientOwnerId));
  const cardSnapshot = await getDocs(cardQuery);

  if (cardSnapshot.empty) {
    throw new Error("El destinatario no tiene una tarjeta asociada.");
  }

  // Devolver el primer documento encontrado
  return cardSnapshot.docs[0];
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
  