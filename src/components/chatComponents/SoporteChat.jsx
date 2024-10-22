import React, { useState, useEffect, useRef } from 'react';
import { Accordion, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import '../../styles/Chat.css';
import { useAuth } from "../../auth/authContext";
import { useNavigate } from 'react-router-dom';
import {
  verifyUserRole,
  subscribeToChats,
  sendReply,
  toggleHumanSupport,
} from "../../api/soporteChatApi";

export const SoporteChat = () => {
  const { currentUser } = useAuth();
  const [chats, setChats] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false); // Estado para autorización
  const [loading, setLoading] = useState(true); // Estado para carga
  const messagesEndRef = useRef(null); // Referencia para el final del contenedor de mensajes
  const navigate = useNavigate(); // Inicializar useNavigate

  // Ref para rastrear la longitud anterior de mensajes
  const prevChatsLengthRef = useRef(0);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!currentUser) {
        // Si no hay usuario autenticado, redirigir a NotFound
        navigate('/notfound');
        return;
      }

      try {
        const userRole = await verifyUserRole(currentUser.uid);
        if (userRole === 'soporte') {
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

    checkAuthorization();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!authorized) return; // No cargar chats si no está autorizado

    const handleChatsUpdate = (chatsData, errorMsg) => {
      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      if (chatsData) {
        // Reproducir sonido si hay nuevos chats
        if (chatsData.length > prevChatsLengthRef.current) {
          // Puedes implementar una lógica similar para reproducir sonidos si lo deseas
          // Por ejemplo, si tienes una referencia a un sonido, puedes reproducirlo aquí
          // notificationSoundRef.current.play();
        }
        // Actualizar la referencia de la longitud anterior
        prevChatsLengthRef.current = chatsData.length;
        setChats(chatsData);
      }
    };

    const unsubscribe = subscribeToChats(handleChatsUpdate);

    return () => unsubscribe();
  }, [authorized]);

  // Hook para desplazar hacia abajo al final de los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  const handleSendReply = async (e, chatId) => {
    e.preventDefault();
    if (newReply.trim()) {
      const newMessage = {
        text: newReply,
        createdAt: new Date(),
        userId: 'soporte',
        userName: 'Soporte',
      };

      try {
        setIsSending(true);
        await sendReply(chatId, newMessage);
        setNewReply('');
      } catch (error) {
        console.error("Error enviando respuesta: ", error);
        setError("Error enviando la respuesta. Inténtalo de nuevo.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleToggleHumanSupport = async (chatId, isActive) => {
    try {
      await toggleHumanSupport(chatId, isActive);
    } catch (error) {
      console.error("Error al cambiar el estado del soporte humano: ", error);
      setError("Error al cambiar el estado del soporte. Inténtalo de nuevo.");
    }
  };

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
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
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
                  <div key={idx} className={`message ${msg.userId === 'soporte' ? "sent" : "received"}`}>
                    <strong>{msg.userName}:</strong> {msg.text}
                    {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Referencia para el final del contenedor */}
              </div>

              {/* Botón para activar/desactivar el soporte humano */}
              <Button
                variant={chat.isHumanSupport ? "danger" : "primary"}
                onClick={() => handleToggleHumanSupport(chat.id, !chat.isHumanSupport)}
                className="mt-2"
              >
                {chat.isHumanSupport ? "Finalizar Soporte Humano" : "Activar Soporte Humano"}
              </Button>

              {/* Formulario para responder */}
              {chat.isHumanSupport && (
                <form onSubmit={(e) => handleSendReply(e, chat.id)} className="reply-form mt-3">
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
