import React, { useState, useEffect, useRef } from 'react';
import { Accordion, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  arrayUnion, 
  where, 
  getDocs 
} from 'firebase/firestore';
import '../../styles/Chat.css';
import { useAuth } from "../../auth/authContext";
import { useNavigate } from 'react-router-dom';

export const SoporteChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false); // Estado para autorización
  const [loading, setLoading] = useState(true); // Estado para carga
  const db = getFirestore();
  const messagesEndRef = useRef(null); // Referencia para el final del contenedor de mensajes
  const navigate = useNavigate(); // Inicializar useNavigate

  useEffect(() => {
    const verifyUserRole = async () => {
      if (!currentUser) {
        // Si no hay usuario autenticado, redirigir a NotFound
        navigate('/notfound');
        return;
      }

      try {
        // 1. Obtener el correo electrónico del usuario desde la colección 'accounts'
        const accountsRef = collection(db, 'accounts');
        const qAccounts = query(accountsRef, where('ownerId', '==', currentUser.uid));
        const querySnapshotAccounts = await getDocs(qAccounts);

        if (querySnapshotAccounts.empty) {
          // No se encontró el documento de la cuenta
          navigate('/notfound');
          return;
        }

        const accountData = querySnapshotAccounts.docs[0].data();
        const userEmail = accountData.email;

        if (!userEmail) {
          // Si no se encuentra el correo electrónico, redirigir
          navigate('/notfound');
          return;
        }

        // 2. Usar el correo electrónico para buscar el rol en la colección 'roles'
        const rolesRef = collection(db, 'roles');
        const qRoles = query(rolesRef, where('email', '==', userEmail));
        const querySnapshotRoles = await getDocs(qRoles);

        if (querySnapshotRoles.empty) {
          // No se encontró el rol del usuario
          navigate('/notfound');
          return;
        }

        const roleData = querySnapshotRoles.docs[0].data();
        const userRole = roleData.role;

        if (userRole === 'soporte') { // Asegúrate de que el rol sea exactamente 'soporte'
          setAuthorized(true);
        } else {
          navigate('/notfound');
        }
      } catch (err) {
        console.error('Error verificando el rol del usuario:', err);
        navigate('/notfound');
      } finally {
        setLoading(false);
      }
    };

    verifyUserRole();
  }, [currentUser, db, navigate]);

  useEffect(() => {
    if (!authorized) return; // No cargar chats si no está autorizado

    const q = query(collection(db, 'chats'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    }, (error) => {
      console.error("Error obteniendo chats:", error);
      setError("Error obteniendo chats. Inténtalo de nuevo más tarde.");
    });

    return () => unsubscribe();
  }, [db, authorized]);

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
        setError("Error enviando la respuesta. Inténtalo de nuevo.");
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
      setError("Error al cambiar el estado del soporte. Inténtalo de nuevo.");
    }
  };

  // Hook para desplazar hacia abajo al final de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  if (loading) {
    // Mostrar un indicador de carga mientras se verifica el rol
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!authorized) {
    // No renderizar el componente si no está autorizado
    return null;
  }

  return (
    <div className="soporte-chat">
      <h3>Chats Pendientes</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Accordion>
        {chats.map((chat) => (
          <Accordion.Item eventKey={chat.id} key={chat.id}>
            <Accordion.Header>
              Chat con {chat.userName || "Usuario Desconocido"}
            </Accordion.Header>
            <Accordion.Body>
              <div className="chat-messages" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                className="mt-2"
              >
                {chat.isHumanSupport ? "Finalizar Soporte Humano" : "Activar Soporte Humano"}
              </Button>

              {/* Formulario para responder */}
              {chat.isHumanSupport && (
                <form onSubmit={(e) => sendReply(e, chat.id)} className="reply-form mt-3">
                  <Row>
                    <Col>
                      <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Escribe una respuesta..."
                        className="form-control"
                        required
                      />
                    </Col>
                    <Col xs="auto">
                      <Button type="submit" disabled={isSending}>
                        {isSending ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </Col>
                  </Row>
                </form>
              )}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};
