import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaCommentAlt, FaTimes } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useAuth } from "../auth/authContext";
import { app } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  arrayUnion,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
import "../styles/Chat.css";

const UserChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const db = getFirestore(app);
  const { currentUser } = useAuth();

  // Referencia de audio para el sonido de notificación
  const notificationSoundRef = useRef(new Audio('https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/audio%2Fnoti.mp3?alt=media&token=0fa14d31-e7dd-4592-8b27-70d1fb93ea12'));

  // Memoriza chatDocRef para evitar recreación en cada renderizado
  const chatDocRef = useMemo(() => {
    return doc(collection(db, "chats"), currentUser?.uid);
  }, [db, currentUser?.uid]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const newMessages = docSnapshot.data().messages || [];
          // Reproducir sonido cuando se recibe un mensaje
          if (newMessages.length > messages.length) {
            notificationSoundRef.current.play();
          }
          setMessages(newMessages);
        } else {
          setMessages([]);
        }
      });
      return () => unsubscribe();
    }
  }, [isOpen, chatDocRef, currentUser]); // Eliminar messages como dependencia

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    scrollToBottom();
  }, [messages]); // Mantener el scroll hacia abajo al recibir nuevos mensajes

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMessageObject = {
        text: newMessage,
        createdAt: new Date(),
        userId: currentUser.uid,
        userName: currentUser.displayName,
      };

      try {
        setIsSending(true);
        await setDoc(
          chatDocRef,
          {
            messages: arrayUnion(newMessageObject),
          },
          { merge: true }
        );

        // Reproducir sonido cuando se envía un mensaje
        notificationSoundRef.current.play();
        
        setNewMessage("");
      } catch (error) {
        console.error("Error enviando mensaje: ", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <div className="user-chat">
      <Button variant="primary" className="chat-icon" onClick={toggleChat}>
        <FaCommentAlt />
      </Button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h5>Chat - Soporte</h5>
            <button className="close-chat" onClick={closeChat}>
              <FaTimes />
            </button>
          </div>
          <div className="chat-messages" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${
                  msg.userId === currentUser.uid ? "sent" : "received"
                }`}
              >
                <div className="message-header">
                  <strong>{msg.userName}</strong>
                </div>
                <div className="message-body">{msg.text}</div>
                <div className="message-timestamp">
                  {msg.createdAt
                    ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} /> {/* Este elemento se usa para hacer scroll */}
          </div>
          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <Button type="submit" disabled={isSending}>
              {isSending ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserChat;
