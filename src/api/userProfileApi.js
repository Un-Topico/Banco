import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

/**
 * Actualiza el nombre del usuario en la base de datos.
 * @param {string} userId - ID del usuario actual.
 * @param {string} newName - Nuevo nombre del usuario.
 * @returns {Promise<void>}
 */
export const updateUserName = async (userId, newName) => {
  const db = getFirestore(app);
  const userDocRef = doc(db, "accounts", "account_" + userId);
  
  try {
    await updateDoc(userDocRef, { name: newName });
  } catch (error) {
    throw new Error("Error al actualizar el nombre.");
  }
};

/**
 * Actualiza el número de teléfono del usuario en la base de datos.
 * @param {string} userId - ID del usuario actual.
 * @param {string} newPhone - Nuevo número de teléfono.
 * @returns {Promise<void>}
 */
export const updateUserPhone = async (userId, newPhone) => {
  const db = getFirestore(app);
  const userDocRef = doc(db, "accounts", "account_" + userId);

  try {
    await updateDoc(userDocRef, { phoneNumber: "+52" + newPhone.trim() });
  } catch (error) {
    throw new Error("Error al actualizar el número de teléfono.");
  }
};
