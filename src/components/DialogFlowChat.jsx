import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaCommentAlt, FaTimes } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useAuth } from "../auth/authContext";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  arrayUnion,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import "../styles/Chat.css";

const DialogFlowChat = () => {
  const db = getFirestore(app);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const notificationSoundRef = useRef(
    new Audio(
      "https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/audio%2Fnoti.mp3?alt=media&token=0fa14d31-e7dd-4592-8b27-70d1fb93ea12"
    )
  );
  const { currentUser } = useAuth();
  const [isHumanSupport, setIsHumanSupport] = useState(false); // Estado para determinar si está en modo soporte humano
  const [hasSentHumanResponse, setHasSentHumanResponse] = useState(false); // Estado para verificar si el mensaje de soporte ha sido enviado

  

  // Memoriza la referencia al documento del chat
  const chatDocRef = useMemo(() => {
    return doc(collection(db, "chats"), currentUser?.uid);
  }, [db, currentUser?.uid]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data();
          const newMessages = chatData.messages || [];
          setIsHumanSupport(chatData.isHumanSupport || false); // Actualiza el estado de soporte humano
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
  }, [isOpen, chatDocRef, currentUser, messages.length]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    scrollToBottom();
  }, [messages]);

  const sendMessageToDialogFlow = async (message) => {
    const requestBody = {
      message: message,
      sessionId: currentUser.uid,
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
      return "Error al recibir respuesta del bot.";
    }
  };

  const saveMessageToDB = async (messageObject) => {
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
    }
  };

  // Enviar mensajes desde el chat
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        text: newMessage,
        createdAt: new Date(),
        userId: currentUser.uid,
        userName: currentUser.displayName,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsSending(true);
      await saveMessageToDB(userMessage);

      // Detectar si el usuario quiere hablar con soporte humano
      if (
        newMessage.toLowerCase().includes("hablar con soporte") ||
        newMessage.toLowerCase().includes("quiero un agente") ||
        newMessage.toLowerCase().includes("soporte")
      ) {
        setIsHumanSupport(true);
        setHasSentHumanResponse(false); // Reinicia el estado al modo soporte humano

        const botMessage = {
          text: "Te estamos conectando con un agente humano. Por favor, espera.",
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(botMessage);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setNewMessage("");
        setIsSending(false);

        // Actualizar en la base de datos que el usuario está en soporte humano
        await setDoc(chatDocRef, { isHumanSupport: true }, { merge: true });
        return;
      }

      // Si el modo soporte humano está activo, no envíes mensajes a DialogFlow
      if (isHumanSupport) {
        // Solo envía el mensaje si no se ha enviado antes
        if (!hasSentHumanResponse) {
          const botMessage = {
            text: "Un agente humano responderá tu mensaje.",
            createdAt: new Date(),
            userId: "bot",
            userName: "Soporte",
          };

          await saveMessageToDB(botMessage);
          setMessages((prevMessages) => [...prevMessages, botMessage]);
          setHasSentHumanResponse(true); // Actualiza el estado a true
        }
        setNewMessage("");
        setIsSending(false);
        return;
      }

      // Si no está en modo soporte humano, enviar el mensaje a DialogFlow
      try {
        const botReply = await sendMessageToDialogFlow(newMessage);
        const botMessage = {
          text: botReply,
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(botMessage);
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        notificationSoundRef.current.play();
      } catch (error) {
        console.error(error);
        const errorMessage = {
          text: "Error al recibir respuesta del bot.",
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(errorMessage);
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setNewMessage("");
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
    <div className="dialogflow-chat">
      <Button variant="primary" className="chat-icon" onClick={toggleChat}>
        <FaCommentAlt />
      </Button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h5>Chat - Soporte Automático</h5>
            <button className="close-chat" onClick={closeChat}>
              <FaTimes />
            </button>
          </div>
          <div
            className="chat-messages"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
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
                    ? new Date(
                        msg.createdAt.seconds
                          ? msg.createdAt.toDate() // Si es un Timestamp de Firebase
                          : msg.createdAt // Si ya es un Date de JavaScript
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
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

export default DialogFlowChat;
