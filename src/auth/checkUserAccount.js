import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
const db = getFirestore(app);

export const checkUserAccount = async (currentUser) => {
    if (currentUser) {
      // Verificar si el usuario ya tiene una cuenta
      const accountsCollection = collection(db, "accounts");
      const q = query(accountsCollection, where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        //Si no esta vacio significa que tiene cuenta
        return true;
      } else {
        //si esta vacio no tiene cuenta
        return false;
      }
    }
}