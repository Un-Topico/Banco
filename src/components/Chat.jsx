import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useAuth } from "../auth/authContext"; // Asegúrate de tener acceso al usuario autenticado
import { app } from "../firebaseConfig";
import '../styles/Chat.css';

// Componente de Chat para el usuario
export const Chat = () => {
  // Obtener el usuario actual desde el contexto de autenticación
  const { currentUser } = useAuth();
  // Estado para almacenar los mensajes y el nuevo mensaje que se va a enviar
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const db = getFirestore(app); // Obtener la instancia de Firestore
  const messagesEndRef = useRef(null); // Referencia para desplazar el chat hacia abajo

  // useEffect para configurar la suscripción en tiempo real a los mensajes del chat
  useEffect(() => {
    // Referencia a la colección de mensajes del usuario actual
    const messagesRef = collection(db, `chats/${currentUser.uid}/messages`);
    // Consulta para ordenar los mensajes por timestamp
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Función para escuchar en tiempo real los cambios en la colección de mensajes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapea los documentos de la colección a un array de objetos mensaje
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs); // Actualiza el estado con la lista de mensajes
      scrollToBottom(); // Desplaza el chat hacia abajo para mostrar el último mensaje
    });

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, [db, currentUser.uid]);

  // Función para manejar el envío de un nuevo mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    if (newMessage.trim() === '') return; // No enviar si el mensaje está vacío

    // Referencia a la colección de mensajes del usuario
    const messagesRef = collection(db, `chats/${currentUser.uid}/messages`);

    // Añadir el nuevo mensaje a la colección
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUser.uid, // ID del remitente (usuario actual)
      senderName: currentUser.displayName || currentUser.email, // Nombre del remitente
      timestamp: serverTimestamp(), // Timestamp del servidor
    });

    // Referencia al documento del chat del usuario
    const chatDocRef = doc(db, 'chats', currentUser.uid);
    // Actualizar el documento del chat con el último mensaje y su timestamp
    await setDoc(chatDocRef, {
      email: currentUser.email,
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
    }, { merge: true });

    // Limpiar el campo de entrada después de enviar el mensaje
    setNewMessage('');
  };

  // Función para desplazar el chat hacia abajo para mostrar el último mensaje
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          // Mostrar cada mensaje en la interfaz
          <div key={msg.id} className={`message ${msg.senderId === currentUser.uid ? 'own-message' : 'other-message'}`}>
            <div className="message-sender">{msg.senderName}</div>
            <div className="message-text">{msg.text}</div>
            <div className="message-timestamp">
              {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : 'Enviando...'}
            </div>
          </div>
        ))}
        {/* Referencia para desplazar el chat hacia abajo */}
        <div ref={messagesEndRef} />
      </div>
      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />
        <button type="submit" className="send-button">Enviar</button>
      </form>
    </div>
  );
};
