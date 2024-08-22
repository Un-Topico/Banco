import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebaseConfig"; 

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result.user)
    // const userEmail = result.user.email;
  } catch (error) {
    console.error("Error al iniciar sesión con Google:", error);
  }
};


export { auth, signInWithGoogle };
