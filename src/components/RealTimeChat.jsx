import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { Chat } from "./Chat";
import { SoporteChat } from "./SoporteChat";
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai";
import "../styles/Chat.css";

export const RealTimeChat = ({ userRole }) => {
  const [isChatOpen, setIsChatOpen] = useState(false); // Estado para abrir/cerrar el chat
  const [isSupportConversationOpen, setIsSupportConversationOpen] = useState(false); // Estado para abrir/cerrar la lista de conversaciones

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // Alterna entre abrir/cerrar el chat
  };

  const toggleSupportConversationList = () => {
    setIsSupportConversationOpen(!isSupportConversationOpen); // Alterna entre abrir/cerrar la lista de conversaciones del soporte
  };

  return (
    <>
      {/* Mostrar el botón flotante para el usuario normal */}
      {userRole !== "soporte" && (
        <div className="chat-icon" onClick={toggleChat}>
          {isChatOpen ? (
            <AiOutlineClose size={40} />
          ) : (
            <AiOutlineMessage size={40} />
          )}
        </div>
      )}

      {/* Mostrar el botón flotante para el soporte */}
      {userRole === "soporte" && (
        <>
          {/* Botón flotante para la lista de conversaciones del soporte */}
          <div className="conversation-list-icon" onClick={toggleSupportConversationList}>
            {isSupportConversationOpen ? (
              <AiOutlineClose size={40} />
            ) : (
              <AiOutlineMessage size={40} />
            )}
          </div>

          {/* Si la lista de conversaciones está abierta, mostrar el SoporteChat */}
          {isSupportConversationOpen && (
            <SoporteChat
              toggleChat={toggleChat} // Pasar la función para abrir/cerrar el chat
              isChatOpen={isChatOpen}  // Pasar el estado de si el chat está abierto
            />
          )}
        </>
      )}

      {/* Chat flotante que se muestra si isChatOpen es true */}
      {isChatOpen && (
        <div className="chat-window">
          <Card>
            <Card>
            {userRole === "soporte" ? '': (
              <div className="chat-header">
              
              <Card.Title>Chat - Soporte</Card.Title>
              {/* Botón para cerrar el chat */}
              <AiOutlineClose size={25} onClick={toggleChat} className="close-icon" />
            </div>
              )}
              {userRole === "soporte" ? (
                /* Si el rol es soporte, mostrar el chat correspondiente */
                <SoporteChat
                  toggleChat={toggleChat}
                  isChatOpen={isChatOpen}
                />
              ) : (
                /* Si el rol no es soporte, mostrar el componente Chat normal */
                <Chat />
              )}
            </Card>
          </Card>
        </div>
      )}
    </>
  );
};
