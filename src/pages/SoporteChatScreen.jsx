import React, { useState, useEffect, useRef } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { getFirestore, collection, query, onSnapshot, doc, setDoc, arrayUnion } from 'firebase/firestore';
import '../styles/Chat.css';

export const SoporteChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const db = getFirestore();
  const messagesEndRef = useRef(null); // Referencia para el final del contenedor de mensajes

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
        setIsSending(true);
        await setDoc(chatRef, {
          messages: arrayUnion(newMessage)
        }, { merge: true });
        setNewReply('');
      } catch (error) {
        console.error("Error enviando respuesta: ", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const toggleHumanSupport = async (chatId, isActive) => {
    const chatRef = doc(db, 'chats', chatId);
    try {
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
    } catch (error) {
      console.error("Error al cambiar el estado del soporte humano: ", error);
    }
  };

  // Hook para desplazar hacia abajo al final de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  return (
  
    <div className="soporte-chat">
      <h3>Chats Pendientes</h3>
      <Accordion>
        {chats.map((chat) => (
          <Accordion.Item eventKey={chat.id} key={chat.id}>
            <Accordion.Header>
              Chat con Usuario
            </Accordion.Header>
            <Accordion.Body>
              <div className="chat-messages" style={{  maxHeight: '300px', overflowY: 'auto' }}>
                {/* Mostrar todos los mensajes del chat */}
                {chat.messages && chat.messages.map((msg, idx) => (
                  <div key={idx} className="message">
                    <strong>{msg.userName}:</strong> {msg.text}
                    {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Referencia para el final del contenedor */}
              </div>

              {/* Botón para activar/desactivar el soporte humano */}
              <Button
                variant={chat.isHumanSupport ? "danger" : "primary"}
                onClick={() => toggleHumanSupport(chat.id, !chat.isHumanSupport)}
              >
                {chat.isHumanSupport ? "Finalizar Soporte Humano" : "Activar Soporte Humano"}
              </Button>

              {/* Formulario para responder */}
              {chat.isHumanSupport && (
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
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};
