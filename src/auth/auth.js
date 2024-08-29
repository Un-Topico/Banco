import { getAuth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configurar la persistencia a nivel de sesión local
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
    await signInWithPopup(auth, googleProvider);
    
    // Guardar la hora de inicio de sesión en localStorage
    localStorage.setItem("loginTime", Date.now());
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
  }
};

const checkSessionExpiration = () => {
  const loginTime = localStorage.getItem("loginTime");
  if (loginTime) {
    const currentTime = Date.now();
    //const oneDay = 60*1000; // 1 Minuto
    const oneDay = 24 * 60 * 60 * 1000; // 1 día en milisegundos

    if (currentTime - loginTime > oneDay) {
      signOut(auth);
      console.log("Sesión expirada. Usuario ha sido desconectado.");
    }
  }
};

// Llamar esta función cuando la app se inicie para verificar la sesión
checkSessionExpiration();

export { auth, signInWithGoogle, checkSessionExpiration };
