import React, { useState, useEffect } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, arrayUnion } from 'firebase/firestore';
import '../styles/Chat.css';

export const SoporteChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isSending, setIsSending] = useState(false); // Estado para el envío
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, 'chats'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    });
    return () => unsubscribe();
  }, [db]);

  const sendReply = async (e, chatId) => {
    e.preventDefault();
    if (newReply.trim()) {
      const chatRef = doc(db, 'chats', chatId);
      const newMessage = {
        text: newReply,
        createdAt: new Date(),
        userId: 'soporte',
        userName: 'Soporte',
      };

      try {
        setIsSending(true); // Cambiar estado al enviar
        await setDoc(chatRef, {
          messages: arrayUnion(newMessage)
        }, { merge: true });
        setNewReply('');
      } catch (error) {
        console.error("Error enviando respuesta: ", error);
      } finally {
        setIsSending(false); // Restablecer el estado al finalizar
      }
    }
  };

  return (
    <div className="soporte-chat">
      <h3>Chats Pendientes</h3>
      <Accordion>
        {chats.map((chat) => (
          <Accordion.Item eventKey={chat.id} key={chat.id}>
            <Accordion.Header>
              Chat con {chat.userName || "Usuario Desconocido"}
            </Accordion.Header>
            <Accordion.Body>
              {/* Mostrar todos los mensajes del chat */}
              {chat.messages && chat.messages.map((msg, idx) => (
                <div key={idx} className="message">
                  <strong>{msg.userName}:</strong> {msg.text}
                  {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}

                </div>
              ))}

              {/* Formulario para responder */}
              <form onSubmit={(e) => sendReply(e, chat.id)} className="reply-form">
                <input
                  type="text"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Escribe una respuesta..."
                />
                <Button type="submit" disabled={isSending}>
                  {isSending ? 'Enviando...' : 'Enviar'}
                </Button>
              </form>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};