import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { app } from "../firebaseConfig";
import '../styles/Chat.css';

export const ChatWindow = ({ chat }) => {
  // Estado para almacenar los mensajes del chat seleccionado
  const [messages, setMessages] = useState([]);
  const [newReply, setNewReply] = useState('');

  // Crear una referencia al archivo de sonido
  const notificationSound = new Audio('https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/audio%2Fnoti.mp3?alt=media&token=0fa14d31-e7dd-4592-8b27-70d1fb93ea12');

  // useEffect para obtener los mensajes del chat seleccionado
  useEffect(() => {
    const db = getFirestore(app);
    const messagesRef = collection(db, `chats/${chat.id}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Función para escuchar en tiempo real los mensajes del chat seleccionado
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs); // Actualiza los mensajes en tiempo real
    });

    return () => unsubscribe();
  }, [chat.id]);

  // Función para manejar el envío de una respuesta
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (newReply.trim() === '') return;

    const db = getFirestore(app);
    const messagesRef = collection(db, `chats/${chat.id}/messages`);

    await addDoc(messagesRef, {
      text: newReply,
      senderId: 'support',
      senderName: 'Soporte',
      timestamp: serverTimestamp(),
    });

    // Actualizar el documento del chat con el último mensaje y su timestamp
    const chatDocRef = doc(db, 'chats', chat.id);
    await setDoc(chatDocRef, {
      lastMessage: newReply,
      lastMessageTimestamp: serverTimestamp(),
    }, { merge: true });

    // Reproducir el sonido de notificación
    notificationSound.play();

    setNewReply(''); // Limpiar el campo de texto
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
