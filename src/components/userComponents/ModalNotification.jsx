import React, { useEffect, useState } from 'react';
import { Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { listenToNotifications, markNotificationAsRead } from '../../api/notificationApi'; // Importar las funciones de la API
import '../../styles/Notification.css';

const ModalNotification = ({ show, handleClose, ownerId }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe;

    if (show && ownerId) {
      unsubscribe = listenToNotifications(ownerId, (notificationsData) => {
        setNotifications(notificationsData);
      });
    }

    // Limpiar la suscripción cuando el componente se desmonte o se cierre el modal
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [show, ownerId]);

  const handleNotificationClick = async (notificationId, transfer_id) => {
    await markNotificationAsRead(notificationId);
    handleClose(); // Cierra el modal después de hacer clic en una notificación
    navigate("/transaccion/" + transfer_id); // Navega a la transferencia correspondiente
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Notificaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="list-group">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification.id, notification.transfer_id)}
              className="list-group-item notification-item d-flex justify-content-between align-items-center"
            >
              <span>{notification.message}</span>
              <Badge bg={notification.read ? 'success' : 'warning'} className="ms-2">
                {notification.read ? 'Leída' : 'No leída'}
              </Badge>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNotification;
