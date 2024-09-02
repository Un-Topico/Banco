import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { app } from "../firebaseConfig";
import '../styles/Chat.css';

// Componente principal para gestionar el chat del soporte
export const SoporteChat = () => {
  // Estado para almacenar la lista de chats y el chat seleccionado
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // useEffect para obtener la lista de chats cuando el componente se monta
  useEffect(() => {
    const db = getFirestore(app);
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastMessageTimestamp', 'desc')); // Consulta para ordenar los chats por el timestamp del último mensaje

    // Función para escuchar en tiempo real los cambios en la colección de chats
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapea los documentos de la colección a un array de objetos chat
      const chatsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsArray); // Actualiza el estado con la lista de chats
    });

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para seleccionar un chat específico
  const selectChat = (chatId) => {
    setSelectedChat(chatId);
  };

  return (
    <div className="soporte-chat">
      <div className="chat-list">
        {chats.map(chat => (
          // Muestra la lista de chats; al hacer clic se selecciona un chat
          <div key={chat.id} onClick={() => selectChat(chat.id)} className="chat-list-item">
            <p>{chat.email}</p> {/* Muestra el correo del usuario que envió el mensaje */}
            <p>{chat.lastMessage}</p> {/* Muestra el último mensaje del chat */}
          </div>
        ))}
      </div>
      {/* Muestra el componente de ChatWindow solo si se ha seleccionado un chat */}
      {selectedChat && <ChatWindow chatId={selectedChat} />}
    </div>
  );
};

// Componente para mostrar y gestionar el chat seleccionado
const ChatWindow = ({ chatId }) => {
  // Estado para almacenar los mensajes del chat seleccionado y el nuevo mensaje
  const [messages, setMessages] = useState([]);
  const [newReply, setNewReply] = useState('');

  // useEffect para obtener los mensajes del chat seleccionado cuando el chatId cambia
  useEffect(() => {
    const db = getFirestore(app);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc')); // Consulta para ordenar los mensajes por timestamp

    // Función para escuchar en tiempo real los cambios en la colección de mensajes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapea los documentos de la colección a un array de objetos mensaje
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs); // Actualiza el estado con la lista de mensajes
    });

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, [chatId]);

  // Función para manejar el envío de una respuesta
  const handleSendReply = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    if (newReply.trim() === '') return; // No enviar si el mensaje está vacío

    const db = getFirestore(app);
    const messagesRef = collection(db, `chats/${chatId}/messages`);

    // Añadir el nuevo mensaje a la subcolección de mensajes del chat
    await addDoc(messagesRef, {
      text: newReply,
      senderId: 'support', // Identificador del remitente, en este caso 'support'
      senderName: 'Soporte', // Nombre del remitente
      timestamp: serverTimestamp(), // Timestamp del servidor
    });

    // Actualizar el documento del chat con el último mensaje y su timestamp
    const chatDocRef = doc(db, 'chats', chatId);
    await setDoc(chatDocRef, {
      lastMessage: newReply,
      lastMessageTimestamp: serverTimestamp(),
    }, { merge: true });

    setNewReply(''); // Limpiar el campo de entrada después de enviar
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.senderId === 'support' ? 'own-message' : 'other-message'}`}>
            <div className="message-sender">{msg.senderName}</div>
            <div className="message-text">{msg.text}</div>
            <div className="message-timestamp">
              {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : 'Enviando...'}
            </div>
          </div>
        ))}
      </div>
      <form className="message-form" onSubmit={handleSendReply}>
        <input
          type="text"
          placeholder="Escribe tu respuesta..."
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-button">Enviar</button>
      </form>
    </div>
  );
};
