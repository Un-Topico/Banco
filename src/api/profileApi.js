import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";

// Inicializar Firestore
const db = getFirestore(app);

// Obtener el rol del usuario
export const getUserRole = async (email) => {
  const rolesCollection = collection(db, "roles");
  const roleQuery = query(rolesCollection, where("email", "==", email));
  const rolesSnapshot = await getDocs(roleQuery);
  
  if (!rolesSnapshot.empty) {
    return rolesSnapshot.docs[0].data().role;
  }
  return null;
};

// Obtener datos de la cuenta del usuario
export const getUserAccount = async (ownerId) => {
  const accountsCollection = collection(db, "accounts");
  const accountQuery = query(accountsCollection, where("ownerId", "==", ownerId));
  const accountSnapshot = await getDocs(accountQuery);
  
  if (!accountSnapshot.empty) {
    return accountSnapshot.docs[0].data();
  }
  return null;
};

// Suscribirse a las tarjetas del usuario y obtener el balance total
export const subscribeToUserCards = (ownerId, callback) => {
  const cardsCollection = collection(db, "cards");
  const cardsQuery = query(cardsCollection, where("ownerId", "==", ownerId));
  
  const unsubscribe = onSnapshot(cardsQuery, (snapshot) => {
    let total = 0;
    const cards = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      total += data.balance;
      cards.push({ id: doc.id, ...data });
    });
    callback({ cards, total });
  });
  
  return unsubscribe;
};

// Obtener transacciones de una tarjeta específica
export const getTransactionsByCardId = async (cardId) => {
  const transactionsRef = collection(db, "transactions");
  const transactionsQuery = query(transactionsRef, where("card_id", "==", cardId));
  const transactionsSnapshot = await getDocs(transactionsQuery);
  
  const transactionsData = transactionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    transaction_date: doc.data().transaction_date.toDate(),
  }));
  
  // Ordenar transacciones por fecha descendente
  transactionsData.sort((a, b) => b.transaction_date - a.transaction_date);
  
  return transactionsData;
};
