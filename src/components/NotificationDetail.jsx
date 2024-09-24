import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getNotificationById } from '../services/transactionService';
export const NotificationDetail = () => {
  const { notificationId } = useParams();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      const notificationData = await getNotificationById(notificationId);
      setNotification(notificationData);
      // Aquí también puedes marcar la notificación como leída si no lo has hecho ya
    };
    fetchNotification();
  }, [notificationId]);

  return (
    <div>
      {notification ? (
        <div>
          <h2>Notificación</h2>
          <p>{notification.message}</p>
          <p>Fecha: {new Date(notification.timestamp).toLocaleString()}</p>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};
