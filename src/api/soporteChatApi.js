import { getFirestore, collection, query, onSnapshot, doc, setDoc, arrayUnion, where, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';
/**
 * Verifica el rol del usuario.
 * @param {string} userId - ID del usuario actual.
 * @returns {Promise<string>} - Rol del usuario.
 */
export const verifyUserRole = async (userId) => {
  const db = getFirestore(app);

  // 1. Obtener el correo electrónico del usuario desde la colección 'accounts'
  const accountsRef = collection(db, 'accounts');
  const qAccounts = query(accountsRef, where('ownerId', '==', userId));
  const querySnapshotAccounts = await getDocs(qAccounts);

  if (querySnapshotAccounts.empty) {
    throw new Error('Cuenta no encontrada');
  }

  const accountData = querySnapshotAccounts.docs[0].data();
  const userEmail = accountData.email;

  if (!userEmail) {
    throw new Error('Correo electrónico no encontrado');
  }

  // 2. Usar el correo electrónico para buscar el rol en la colección 'roles'
  const rolesRef = collection(db, 'roles');
  const qRoles = query(rolesRef, where('email', '==', userEmail));
  const querySnapshotRoles = await getDocs(qRoles);

  if (querySnapshotRoles.empty) {
    throw new Error('Rol no encontrado');
  }

  const roleData = querySnapshotRoles.docs[0].data();
  const userRole = roleData.role;

  return userRole;
};

/**
 * Suscribe en tiempo real a los chats.
 * @param {function} callback - Función a ejecutar cuando se actualizan los datos.
 * @returns {function} - Función para desuscribirse del listener.
 */
export const subscribeToChats = (callback) => {
  const db = getFirestore(app);
  const q = query(collection(db, 'chats'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chatsData);
  }, (error) => {
    console.error("Error obteniendo chats:", error);
    callback(null, "Error obteniendo chats. Inténtalo de nuevo más tarde.");
  });

  return unsubscribe;
};

/**
 * Envía una respuesta al chat.
 * @param {string} chatId - ID del chat.
 * @param {Object} messageObject - Objeto del mensaje a enviar.
 * @returns {Promise<void>}
 */
export const sendReply = async (chatId, messageObject) => {
  const db = getFirestore(app);
  const chatRef = doc(db, 'chats', chatId);

  await setDoc(chatRef, {
    messages: arrayUnion(messageObject)
  }, { merge: true });
};

/**
 * Alterna el estado de soporte humano en el chat.
 * @param {string} chatId - ID del chat.
 * @param {boolean} isActive - Estado de soporte humano.
 * @returns {Promise<void>}
 */
export const toggleHumanSupport = async (chatId, isActive) => {
  const db = getFirestore(app);
  const chatRef = doc(db, 'chats', chatId);

  await setDoc(chatRef, { isHumanSupport: isActive }, { merge: true });

  if (!isActive) {
    const botMessage = {
      text: "El agente ha finalizado el soporte. El bot retomará la conversación.",
      createdAt: new Date(),
      userId: 'bot',
      userName: 'Bot',
    };
    await setDoc(chatRef, {
      messages: arrayUnion(botMessage)
    }, { merge: true });
  }
};
