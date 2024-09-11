import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { app } from "../firebaseConfig";
import '../styles/Chat.css';
import { ChatWindow } from './ChatWindow';
// Componente principal para gestionar el chat del soporte
export const SoporteChat = () => {
  // Estado para almacenar la lista de chats y el chat seleccionado
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // useEffect para obtener la lista de chats cuando el componente se monta
  useEffect(() => {
    const db = getFirestore(app);
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastMessageTimestamp', 'desc')); // Ordena los chats por el último mensaje

    // Función para escuchar en tiempo real los cambios en la colección de chats
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsArray); // Actualiza el estado con la lista de chats
    });

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para seleccionar un chat específico
  const selectChat = (chat) => {
    setSelectedChat(chat); // Almacena el chat seleccionado
  };

  return (
    <div className="soporte-chat">
      <div className="chat-list">
        {chats.map(chat => (
          <div key={chat.id} onClick={() => selectChat(chat)} className="chat-list-item">
            <p>{chat.email}</p> {/* Muestra el correo del usuario */}
            <p>{chat.lastMessage}</p> {/* Muestra el último mensaje */}
          </div>
        ))}
      </div>

      {/* Muestra el componente de ChatWindow si hay un chat seleccionado */}
      {selectedChat && <ChatWindow chat={selectedChat} />}
    </div>
  );
};
