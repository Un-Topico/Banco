import React, { useEffect, useState } from 'react';
import { Modal, Badge } from 'react-bootstrap'; // Puedes importar ambos desde react-bootstrap
import { markNotificationAsRead } from '../../services/firestoreTransactionService';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Importar onSnapshot
import { getFirestore } from 'firebase/firestore';
import '../../styles/Notification.css'

const db = getFirestore();

const ModalNotification = ({ show, handleClose, ownerId }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe;
    
    const fetchNotifications = () => {
      if (ownerId) {
        const q = query(
          collection(db, "notifications"), 
          where("ownerId", "==", ownerId)
        );

        // Usamos onSnapshot para obtener las notificaciones en tiempo real
        unsubscribe = onSnapshot(q, (snapshot) => {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(notificationsData);
        });
      }
    };

    if (show) {
      fetchNotifications();
    }

    // Limpiar la suscripción cuando el componente se desmonte o se cierre el modal
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [show, ownerId]);

  const handleNotificationClick = async (notificationId, transfer_id) => {
    await markNotificationAsRead(notificationId);
    handleClose(); // Cierra el modal después de hacer clic en una notificación
    navigate("/transaccion/"+transfer_id); // Navega a la transferencia correspondiente
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
