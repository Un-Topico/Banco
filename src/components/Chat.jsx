import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useAuth } from "../auth/authContext"; 
import { app } from "../firebaseConfig";
import '../styles/Chat.css';

export const Chat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const db = getFirestore(app);
  const messagesContainerRef = useRef(null); // Referencia al contenedor de mensajes

  // Función para desplazar el chat hacia abajo
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight; // Desplazar al final
    }
  };

  useEffect(() => {
    const messagesRef = collection(db, `chats/${currentUser.uid}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs); 
    });

    return () => unsubscribe();
  }, [db, currentUser.uid]);

  useEffect(() => {
    scrollToBottom(); // Desplazar hacia el final cada vez que se actualicen los mensajes
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, `chats/${currentUser.uid}/messages`);

    await addDoc(messagesRef, {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    });

    const chatDocRef = doc(db, 'chats', currentUser.uid);
    await setDoc(chatDocRef, {
      email: currentUser.email,
      lastMessage: newMessage,
      lastMessageTimestamp: serverTimestamp(),
    }, { merge: true });

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      {/* Contenedor de mensajes con referencia */}
      <div className="messages" ref={messagesContainerRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.senderId === currentUser.uid ? 'own-message' : 'other-message'}`}>
            <div className="message-sender">{msg.senderName}</div>
            <div className="message-text">{msg.text}</div>
            <div className="message-timestamp">
              {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : 'Enviando...'}
            </div>
          </div>
        ))}
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
