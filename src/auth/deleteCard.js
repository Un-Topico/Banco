import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export const deleteCard = async (cardId) => {
  try {
    const cardDocRef = doc(db, "cards", cardId);
    await deleteDoc(cardDocRef);
    alert("Tarjeta eliminada correctamente");
  } catch (error) {
    alert("Error al eliminar la tarjeta: ", error);
  }
};
