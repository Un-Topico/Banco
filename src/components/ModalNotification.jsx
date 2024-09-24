// ModalNotification.jsx
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { getNotificationsByOwnerId, markNotificationAsRead } from '../services/transactionService'; // Importa tus servicios

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
            <li key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
              {notification.read ? <s>{notification.message}</s> : notification.message}
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default ModalNotification;
