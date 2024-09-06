import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
const db = getFirestore(app);

export const checkUserAccount = async (currentUser) => {
    if (currentUser) {
      // Verificar si el usuario ya tiene una cuenta
      const accountsCollection = collection(db, "accounts");
      const q = query(accountsCollection, where("ownerId", "==", currentUser.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Si no tiene cuenta, redirigir a la página de crear cuenta
        return false;
      } else {
        // Si ya tiene cuenta, redirigir al perfil
        return true;
      }
    }
}