// src/api/chatApi.js
import { getFirestore, collection, doc, setDoc, arrayUnion, onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Obtiene la referencia al documento de chat del usuario.
 * @param {string} userId - ID del usuario actual.
 * @returns {DocumentReference} - Referencia al documento de chat.
 */
export const getChatDocRef = (userId) => {
  const db = getFirestore(app);
  return doc(collection(db, "chats"), userId);
};

/**
 * Escucha en tiempo real los mensajes del chat del usuario.
 * @param {DocumentReference} chatDocRef - Referencia al documento de chat.
 * @param {function} callback - Función a ejecutar cuando se actualizan los datos.
 * @returns {function} - Función para desuscribirse del listener.
 */
export const subscribeToChat = (chatDocRef, callback) => {
  return onSnapshot(chatDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const chatData = docSnapshot.data();
      const messages = chatData.messages || [];
      const isHumanSupport = chatData.isHumanSupport || false;
      callback({ messages, isHumanSupport });
    } else {
      callback({ messages: [], isHumanSupport: false });
    }
  });
};

/**
 * Guarda un mensaje en la base de datos.
 * @param {DocumentReference} chatDocRef - Referencia al documento de chat.
 * @param {Object} messageObject - Objeto del mensaje a guardar.
 * @returns {Promise<void>}
 */
export const saveMessageToDB = async (chatDocRef, messageObject) => {
  try {
    await setDoc(
      chatDocRef,
      {
        messages: arrayUnion(messageObject),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error guardando mensaje en la base de datos: ", error);
    throw error;
  }
};

/**
 * Envía un mensaje a DialogFlow y obtiene la respuesta.
 * @param {string} userId - ID del usuario actual.
 * @param {string} message - Mensaje a enviar.
 * @returns {Promise<string>} - Respuesta de DialogFlow.
 */
export const sendMessageToDialogFlow = async (userId, message) => {
  const requestBody = {
    message: message,
    sessionId: userId,
  };

  try {
    const response = await fetch(
      "https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/dialogflow-package/send-dialogflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error("Error al comunicarse con la función de Digital Ocean");
    }

    const text = await response.text();
    if (text) {
      const data = JSON.parse(text);
      return data.response;
    } else {
      throw new Error("Respuesta vacía del servidor.");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw new Error("Error al recibir respuesta del bot.");
  }
};

/**
 * Actualiza el estado de soporte humano en la base de datos.
 * @param {DocumentReference} chatDocRef - Referencia al documento de chat.
 * @param {boolean} isHumanSupport - Estado de soporte humano.
 * @returns {Promise<void>}
 */
export const updateHumanSupportStatus = async (chatDocRef, isHumanSupport) => {
  try {
    await setDoc(chatDocRef, { isHumanSupport }, { merge: true });
  } catch (error) {
    console.error("Error actualizando el estado de soporte humano: ", error);
    throw error;
  }
};
