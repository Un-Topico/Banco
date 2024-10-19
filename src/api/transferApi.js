import {
    getFirestore,
    doc,
    setDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
  } from 'firebase/firestore';
  
  const db = getFirestore();
  
  // Función para obtener la tarjeta del destinatario por correo electrónico
  export const getCardDocByEmail = async (email) => {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error('No se encontró una cuenta asociada a este correo electrónico.');
    }
  
    const recipientAccount = querySnapshot.docs[0].data();
    const recipientOwnerId = recipientAccount.ownerId;
  
    const cardsRef = collection(db, 'cards');
    const cardQuery = query(cardsRef, where('ownerId', '==', recipientOwnerId));
    const cardSnapshot = await getDocs(cardQuery);
  
    if (cardSnapshot.empty) {
      throw new Error('El destinatario no tiene una tarjeta asociada.');
    }
  
    return cardSnapshot.docs[0];
  };
  
  // Función para obtener la tarjeta del destinatario por CLABE
  export const getCardDocByClabe = async (clabe) => {
    const cardsRef = collection(db, 'cards');
    const q = query(cardsRef, where('clabeNumber', '==', clabe));
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) {
      throw new Error('No se encontró una tarjeta asociada a este número CLABE.');
    }
  
    return querySnapshot.docs[0];
  };
  
  // Función para enviar mensaje al destinatario
  export const sendMessage = async (phoneNumber, amount) => {
    try {
      const response = await fetch(
        'https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/twilio-package/send-message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phoneNumber,
            body: `Has recibido una transferencia de ${amount} MXN.`,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };
  
  // Función para proceder con la transferencia
  export const proceedWithTransfer = async ({
    selectedCard,
    amount,
    email,
    clabe,
    description,
  }) => {
    try {
      const parsedMonto = parseFloat(amount);
  
      // Validaciones en el backend
      if (isNaN(parsedMonto) || parsedMonto <= 0) {
        throw new Error('El monto debe ser un número válido mayor que cero.');
      }
  
      if (!/^(\d+(\.\d{0,2})?)?$/.test(amount)) {
        throw new Error('El monto no puede tener más de 2 decimales.');
      }
  
      if (parsedMonto > selectedCard.balance) {
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      }
  
      let recipientCardDoc;
  
      if (clabe) {
        recipientCardDoc = await getCardDocByClabe(clabe);
      } else if (email) {
        recipientCardDoc = await getCardDocByEmail(email);
      }
  
      if (!recipientCardDoc) {
        throw new Error('No se encontró la tarjeta del destinatario.');
      }
  
      const newBalance = selectedCard.balance - parsedMonto;
      if (newBalance < 0) {
        throw new Error('No tienes suficiente saldo para realizar esta transferencia.');
      }
  
      const recipientOwnerId = recipientCardDoc.data().ownerId;
      const recipientNewBalance = recipientCardDoc.data().balance + parsedMonto;
  
      // Actualizar el saldo de la tarjeta del remitente
      const cardRef = doc(db, 'cards', selectedCard.id);
      await setDoc(cardRef, { balance: newBalance }, { merge: true });
  
      // Actualizar el saldo de la tarjeta del destinatario
      const recipientCardRef = doc(db, 'cards', recipientCardDoc.id);
      await setDoc(recipientCardRef, { balance: recipientNewBalance }, { merge: true });
  
      // Guardar la transferencia en la colección 'transfers'
      const transferId = `transfer_${Date.now()}`;
      const transferRef = doc(db, 'transfers', transferId);
  
      await setDoc(transferRef, {
        transfer_id: transferId,
        from_card_id: selectedCard.id,
        to_card_id: recipientCardDoc.id,
        amount: parsedMonto,
        transfer_date: new Date(),
        description: description || 'Sin descripción',
      });
  
      // Guardar las transacciones en la colección 'transactions'
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now()}`,
        card_id: selectedCard.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: description || 'Sin descripción',
        status: 'sent',
      });
      await addDoc(collection(db, 'transactions'), {
        transaction_id: `transaction_${Date.now() + 1}`,
        card_id: recipientCardDoc.id,
        transaction_type: 'Transferencia',
        amount: parsedMonto,
        transaction_date: new Date(),
        description: description || 'Sin descripción',
        status: 'received',
      });
  
      // Crear la notificación para el destinatario
      await addDoc(collection(db, 'notifications'), {
        notificationId: `notification_${Date.now()}`,
        transfer_id: transferId,
        ownerId: recipientOwnerId,
        message: `Has recibido una transferencia de $${parsedMonto} MXN.`,
        cardId: recipientCardDoc.id,
        read: false,
        timestamp: new Date(),
      });
  
      // Enviar mensaje al destinatario si tiene número de teléfono
      const recipientPhoneNumber = recipientCardDoc.data().phoneNumber;
      if (recipientPhoneNumber) {
        await sendMessage(recipientPhoneNumber, parsedMonto);
      }
  
      return { success: true, message: 'La transferencia se ha realizado con éxito.' };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Error: ${error.message}` };
    }
  };
  