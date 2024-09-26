// import React, { useState, useEffect } from 'react';
// import { Accordion, Card, Button } from 'react-bootstrap';
// import { getFirestore, collection, query, onSnapshot, doc, setDoc, arrayUnion } from 'firebase/firestore';
// import { useAuth } from "../auth/authContext"; // Asegúrate de tener el contexto de autenticación

// const SoporteChat = () => {
//   const [chats, setChats] = useState([]);
//   const [selectedChatId, setSelectedChatId] = useState(null);
//   const [newReply, setNewReply] = useState('');
//   const db = getFirestore();
//   const { currentUser } = useAuth(); // Suponiendo que ya tienes autenticación implementada

//   // Lógica para obtener los chats pendientes de responder
//   useEffect(() => {
//     const q = query(collection(db, 'chats'));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const chatsData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setChats(chatsData);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Enviar respuesta al usuario desde el soporte
//   const sendReply = async (e, chatId) => {
//     e.preventDefault();
//     if (newReply.trim()) {
//       const chatRef = doc(db, 'chats', chatId);
//       const newMessage = {
//         text: newReply,
//         createdAt: new Date(),
//         userId: 'soporte', // Identificador del soporte
//         userName: 'Soporte',
//       };

//       try {
//         // Actualizar el chat específico con la respuesta del soporte
//         await setDoc(chatRef, {
//           messages: arrayUnion(newMessage)
//         }, { merge: true });
//         setNewReply('');
//       } catch (error) {
//         console.error("Error enviando respuesta: ", error);
//       }
//     }
//   };

//   return (
//     <div className="soporte-chat">
//       <h3>Chats Pendientes</h3>
//       <Accordion>
//         {chats.map((chat) => (
//           <Card key={chat.id}>
//             <Card.Header>
//               <Accordion.Toggle
//                 as={Button}
//                 variant="link"
//                 eventKey={chat.id}
//                 onClick={() => setSelectedChatId(chat.id)}
//               >
//                 Chat con {chat.userName}
//               </Accordion.Toggle>
//             </Card.Header>
//             <Accordion.Collapse eventKey={chat.id}>
//               <Card.Body>
//                 {/* Mostrar todos los mensajes del chat */}
//                 {chat.messages && chat.messages.map((msg, idx) => (
//                   <p key={idx}>
//                     <strong>{msg.userName}:</strong> {msg.text}
//                   </p>
//                 ))}

//                 {/* Formulario para responder */}
//                 <form onSubmit={(e) => sendReply(e, chat.id)}>
//                   <input
//                     type="text"
//                     value={newReply}
//                     onChange={(e) => setNewReply(e.target.value)}
//                     placeholder="Escribe una respuesta..."
//                   />
//                   <Button type="submit">Enviar</Button>
//                 </form>
//               </Card.Body>
//             </Accordion.Collapse>
//           </Card>
//         ))}
//       </Accordion>
//     </div>
//   );
// };

// export default SoporteChat;
