import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../firebaseConfig';

const db = getFirestore(app);

/**
 * Escucha las notificaciones en tiempo real de un usuario específico.
 * @param {string} ownerId - ID del propietario (usuario actual).
 * @param {function} onSuccess - Función que maneja los datos obtenidos con éxito.
 * @returns {function} - Función para cancelar la suscripción.
 */
export const listenToNotifications = (ownerId, onSuccess) => {
  const q = query(
    collection(db, 'notifications'),
    where('ownerId', '==', ownerId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notificationsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onSuccess(notificationsData);
  });

  return unsubscribe;
};

/**
 * Marca una notificación como leída en Firestore.
 * @param {string} notificationId - ID de la notificación a marcar como leída.
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};
