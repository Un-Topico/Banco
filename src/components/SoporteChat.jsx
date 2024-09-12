import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { app } from "../firebaseConfig";
import { ChatWindow } from './ChatWindow';
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai"; // Importamos el ícono de chat y el de cerrar
import "../styles/Chat.css"; // Asegúrate de agregar las clases al archivo CSS

export const SoporteChat = ({ toggleChat, isChatOpen }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isConversationListOpen, setIsConversationListOpen] = useState(false); // Controla la visibilidad de la lista de conversaciones

  useEffect(() => {
    const db = getFirestore(app);
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastMessageTimestamp', 'desc')); // Ordena los chats por el último mensaje

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsArray);
    });

    return () => unsubscribe();
  }, []);

  const selectChat = (chat) => {
    setSelectedChat(chat);
    toggleChat(); // Abre el chat
  };

  const toggleConversationList = () => {
    setIsConversationListOpen(!isConversationListOpen); // Alterna la visibilidad de la lista de conversaciones
  };

  return (
    <>
      {/* Botón flotante para abrir la lista de conversaciones */}
      <div className="conversation-list-icon" onClick={toggleConversationList}>
        {isConversationListOpen ? (
          <AiOutlineClose size={40} />
        ) : (
          <AiOutlineMessage size={40} />
        )}
      </div>

      {/* Contenedor flotante de la lista de conversaciones */}
      {isConversationListOpen && (
        <div className="conversation-list-window">
            <strong>Chats por responder:</strong>

          <div className="conversation-list">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => selectChat(chat)}
                className="chat-list-item"
              >
                <p>{chat.email}</p>
                <p>{chat.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ChatWindow se abre si isChatOpen es true y hay un chat seleccionado */}
      {isChatOpen && selectedChat && <ChatWindow chat={selectedChat} />}
    </>
  );
};
