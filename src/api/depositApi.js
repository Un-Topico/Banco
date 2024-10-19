import { 
    doc, 
    setDoc, 
    collection, 
    addDoc 
  } from 'firebase/firestore';
  import { 
    reauthenticateWithCredential, 
    EmailAuthProvider 
  } from 'firebase/auth';
  import { reauthenticateWithGoogle } from '../auth/auth'; // Ajusta la ruta según tu estructura de carpetas
  import { getAuth } from 'firebase/auth';
  
  // Expresión regular para validar monto: números positivos con hasta 2 decimales
  const montoRegex = /^\d+(\.\d{0,2})?$/;
  
  /**
   * Inicia la reautenticación del usuario.
   * @param {Object} currentUser - El usuario actual autenticado.
   * @returns {Promise<Object>} Resultado de la reautenticación.
   */
  export const initiateReauthentication = async (currentUser) => {
    try {
      const providerData = currentUser.providerData;
      const isGoogleUser = providerData.some(provider => provider.providerId === 'google.com');
  
      if (isGoogleUser) {
        // Reautenticación con Google
        const reauthResult = await reauthenticateWithGoogle();
        return reauthResult;
      } else {
        // Reautenticación con correo y contraseña
        // La lógica para reautenticación con email se manejará en el componente
        return { requiresPassword: true };
      }
    } catch (err) {
      console.error(err);
      throw new Error('Error en la reautenticación.');
    }
  };
  
  /**
   * Procesa el depósito de fondos.
   * @param {Object} params - Parámetros necesarios para el depósito.
   * @param {Object} params.db - Instancia de Firestore.
   * @param {Object} params.selectedCard - Tarjeta seleccionada para el depósito.
   * @param {number} params.monto - Monto a depositar.
   * @param {string} params.descripcion - Descripción del depósito.
   * @returns {Promise<void>}
   */
  export const proceedWithDeposit = async ({ db, selectedCard, monto, descripcion }) => {
    if (!Number.isFinite(monto) || monto <= 0 || !montoRegex.test(monto.toString())) {
      throw new Error('Monto inválido. Asegúrate de ingresar un número positivo con máximo 2 decimales.');
    }
  
    const newBalance = selectedCard.balance + monto;
  
    // Actualizar el balance de la tarjeta
    const cardRef = doc(db, 'cards', selectedCard.id);
    await setDoc(cardRef, { balance: newBalance }, { merge: true });
  
    // Agregar la transacción
    await addDoc(collection(db, 'transactions'), {
      transaction_id: `transaction_${Date.now()}`,
      card_id: selectedCard.id,
      transaction_type: 'Deposito',
      amount: monto,
      transaction_date: new Date(),
      description: descripcion || 'Sin descripción',
      status: 'received',
      ownerId: selectedCard.ownerId,
    });
  };
  
  /**
   * Reautentica al usuario con correo y contraseña.
   * @param {Object} params - Parámetros necesarios para la reautenticación.
   * @param {string} params.email - Correo electrónico del usuario.
   * @param {string} params.password - Contraseña del usuario.
   * @returns {Promise<void>}
   */
  export const reauthenticateWithEmail = async ({ email, password }) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      throw new Error('No hay usuario autenticado.');
    }
  
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
  };
  