import React, { useState, useEffect, useRef } from "react";
import { FaCommentAlt, FaTimes } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { useAuth } from "../auth/authContext";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { app } from "../firebaseConfig";
import "../styles/Chat.css";

const DialogFlowChat = () => {
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
  const [cards, setCards] = useState([]);

  const db = getFirestore(app);

  // Función para obtener las tarjetas del usuario desde Firebase
  const getUserCards = () => {
    const q = query(collection(db, "cards"), where("ownerId", "==", currentUser.uid));
    onSnapshot(q, (querySnapshot) => {
      const cardsData = [];
      querySnapshot.forEach((doc) => {
        cardsData.push({ ...doc.data(), id: doc.id });
      });
      setCards(cardsData);
    });
  };

  useEffect(() => {
    if (currentUser?.uid) {
      getUserCards(); // Obtener las tarjetas del usuario al montar el componente
    }
  }, [currentUser]);
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
    console.log(requestBody);

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

      // Si el usuario pide el saldo, responder con la información de las tarjetas
      if (newMessage.toLowerCase().includes("saldo") || newMessage.toLowerCase().includes("cuenta")) {
        const cardBalances = cards
          .map((card) => `Tarjeta: ${card.cardNumber}, Saldo: ${card.balance} `)
          .join("\n");
        const botMessage = {
          text: cardBalances || "No tienes tarjetas registradas.",
          createdAt: new Date(),
          userId: "bot",
          userName: "Soporte",
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setNewMessage("");
        setIsSending(false);
        return;
      }

      try {
        const botReply = await sendMessageToDialogFlow(newMessage);
        const botMessage = {
          text: botReply,
          createdAt: new Date(),
          userId: "bot",
          userName: "Soporte",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        notificationSoundRef.current.play();
      } catch (error) {
        console.error(error);
        const errorMessage = {
          text: "Error al recibir respuesta del bot.",
          createdAt: new Date(),
          userId: "bot",
          userName: "Soporte",
        };
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
          <div className="chat-messages" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.userId === currentUser.uid ? "sent" : "received"}`}
              >
                <div className="message-header">
                  <strong>{msg.userName}</strong>
                </div>
                <div className="message-body">{msg.text}</div>
                <div className="message-timestamp">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
