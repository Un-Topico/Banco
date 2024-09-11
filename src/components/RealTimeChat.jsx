import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { Chat } from "./Chat";
import { SoporteChat } from "./SoporteChat";
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai"; // Importamos el ícono de chat y el de cerrar
import "../styles/Chat.css"; // Asegúrate de agregar las clases al archivo CSS

export const RealTimeChat = ({ userRole }) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // Estado para controlar si el chat está abierto

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // Alterna entre abrir/cerrar el chat
  };

  return (
    <>
      {/* Botón flotante en la parte inferior derecha */}
      <div className="chat-icon" onClick={toggleChat}>
        <AiOutlineMessage size={40} />
      </div>

      {/* Chat flotante que se muestra si isChatOpen es true */}
      {isChatOpen && (
        <div className="chat-window">
          <Card>
            <Card.Body>
              <div className="chat-header">
                <Card.Title>Chat en Tiempo Real</Card.Title>
                {/* Botón para cerrar el chat */}
                <AiOutlineClose size={25} onClick={toggleChat} className="close-icon" />
              </div>
              {userRole === "soporte" ? <SoporteChat /> : <Chat />}
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  );
};
