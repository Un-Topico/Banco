import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Badge } from 'react-bootstrap'; // Asegúrate de importar Badge
import { getNotificationsByOwnerId, markNotificationAsRead } from '../services/transactionService'; // Importa tus servicios
import { Link } from 'react-router-dom';

const ModalNotification = ({ show, handleClose, ownerId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (ownerId) {
        const notificationsData = await getNotificationsByOwnerId(ownerId);
        setNotifications(notificationsData);
      }
    };

    if (show) {
      fetchNotifications();
    }
  }, [show, ownerId]);

  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    handleClose(); // Cierra el modal después de hacer clic en una notificación
    // Aquí podrías agregar la redirección si es necesario
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Notificaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id} onClick={() => handleNotificationClick(notification.notificationId)}>
              <Link to={"notificacion/"+ notification.notificationId}>{notification.message} 
              <Badge bg={notification.read ? 'success' : 'warning'} className="ms-2">
                {notification.read ? 'Leída' : 'No leída'}
              </Badge>
              </Link>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNotification;
