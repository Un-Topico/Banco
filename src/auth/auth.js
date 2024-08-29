// auth.js
import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { app } from "../firebaseConfig";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

const setAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Error al configurar la persistencia:", error);
  }
};

const signInWithGoogle = async () => {
  try {
    await setAuthPersistence();
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;
    const userEmail = user.email;

    await checkAndAssignRole(userEmail);
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
  }
};

// Verifica y asigna un rol a un usuario
const checkAndAssignRole = async (userEmail) => {
  const rolesCollection = collection(db, "roles");
  const q = query(rolesCollection, where("email", "==", userEmail));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // No existe un rol para este usuario, así que crea uno nuevo
    const roleDocRef = doc(rolesCollection, userEmail);
    await setDoc(roleDocRef, {
      email: userEmail,
      role: "user"
    });
    console.log("Nuevo rol creado para el usuario:", userEmail);

  } else {
    console.log("El usuario ya tiene un rol asignado.");
    
    // Redirige al perfil si ya tiene un rol asignado
    window.location.href = "/perfil";
  }
};

const checkSessionExpiration = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (loginTime) {
    const currentTime = Date.now();
    const oneMinute = 24* 60 *60 * 1000; // 1 minuto en milisegundos

    if (currentTime - loginTime > oneMinute) {
      signOut(auth);
      console.log("Sesión expirada. Usuario ha sido desconectado.");
    }
  }
};

// Llamar esta función cuando la app se inicie para verificar la sesión
checkSessionExpiration();

export { auth, signInWithGoogle, checkSessionExpiration };
