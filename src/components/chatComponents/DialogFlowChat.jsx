import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaCommentAlt, FaTimes } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useAuth } from "../../auth/authContext";
import "../../styles/Chat.css";
import {
  getChatDocRef,
  subscribeToChat,
  saveMessageToDB,
  sendMessageToDialogFlow,
  updateHumanSupportStatus,
} from "../../api/chatApi";

const DialogFlowChat = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isHumanSupport, setIsHumanSupport] = useState(false);
  const [hasSentHumanResponse, setHasSentHumanResponse] = useState(false);
  const chatEndRef = useRef(null);
  const notificationSoundRef = useRef(
    new Audio(
      "https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/audio%2Fnoti.mp3?alt=media&token=0fa14d31-e7dd-4592-8b27-70d1fb93ea12"
    )
  );

  // Ref para rastrear la longitud anterior de mensajes
  const prevMessagesLengthRef = useRef(0);

  // Memoriza la referencia al documento del chat
  const chatDocRef = useMemo(() => {
    if (currentUser?.uid) {
      return getChatDocRef(currentUser.uid);
    }
    return null;
  }, [currentUser?.uid]);

  useEffect(() => {
    if (isOpen && chatDocRef) {
      const unsubscribe = subscribeToChat(chatDocRef, ({ messages, isHumanSupport }) => {
        // Reproducir sonido si hay nuevos mensajes
        if (messages.length > prevMessagesLengthRef.current) {
          notificationSoundRef.current.play();
        }
        // Actualizar la referencia de la longitud anterior
        prevMessagesLengthRef.current = messages.length;
        setMessages(messages);
        setIsHumanSupport(isHumanSupport);
      });

      return () => unsubscribe();
    }
  }, [isOpen, chatDocRef]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Solo llama a scrollToBottom si hay nuevos mensajes
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && chatDocRef && currentUser) {
      setIsSending(true);

      try {
        // Crear el objeto del mensaje del usuario
        const userMessage = {
          text: newMessage,
          createdAt: new Date(),
          userId: currentUser.uid,
          userName: currentUser.displayName || "Usuario",
        };

        // Guarda el mensaje en la base de datos
        await saveMessageToDB(chatDocRef, userMessage);

        // Detectar si el usuario quiere hablar con soporte humano
        const lowerCaseMessage = newMessage.toLowerCase();
        if (
          lowerCaseMessage.includes("hablar con soporte") ||
          lowerCaseMessage.includes("quiero un agente") ||
          lowerCaseMessage.includes("soporte")
        ) {
          setIsHumanSupport(true);
          setHasSentHumanResponse(false);

          const botMessage = {
            text: "Te estamos conectando con un agente humano. Por favor, espera.",
            createdAt: new Date(),
            userId: "bot",
            userName: "UnBot",
          };

          await saveMessageToDB(chatDocRef, botMessage);

          // Actualizar en la base de datos que el usuario está en soporte humano
          await updateHumanSupportStatus(chatDocRef, true);
          return;
        }

        // Si el modo soporte humano está activo, no envíes mensajes a DialogFlow
        if (isHumanSupport) {
          if (!hasSentHumanResponse) {
            const botMessage = {
              text: "Un agente humano responderá tu mensaje.",
              createdAt: new Date(),
              userId: "bot",
              userName: "Soporte",
            };

            // Guardar el mensaje en la base de datos
            await saveMessageToDB(chatDocRef, botMessage);
            setHasSentHumanResponse(true);
          }
          return;
        }

        // Si no está en modo soporte humano, enviar el mensaje a DialogFlow
        const botReply = await sendMessageToDialogFlow(currentUser.uid, newMessage);
        const botMessage = {
          text: botReply,
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(chatDocRef, botMessage);
      } catch (error) {
        console.error(error);
        const errorMessage = {
          text: "Error al recibir respuesta del bot.",
          createdAt: new Date(),
          userId: "bot",
          userName: "UnBot",
        };

        await saveMessageToDB(chatDocRef, errorMessage);
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
          <form onSubmit={handleSendMessage} className="message-form">
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
