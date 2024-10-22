import { getAuth, GoogleAuthProvider, signInWithPopup, updatePassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { reauthenticateWithPopup } from "firebase/auth";
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // Initialize Firestore

const signUpWithEmail = async (email, password, captchaToken) => {
  try {
    // Llamar a la función de DigitalOcean para verificar el token de reCAPTCHA
    const response = await fetch('https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/verify-recaptcha-package/send-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ captchaToken }), // Asegúrate de pasar el captchaToken correctamente
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error('Verificación de reCAPTCHA fallida');
    }

    await setAuthPersistence();
    const result = await createUserWithEmailAndPassword(auth, email, password);

    const user = result.user;
    const userEmail = user.email;

    // Verifica si el usuario ya tiene un rol
    await checkAndAssignRole(userEmail);
    return { success: true };
  } catch (error) {
    console.error(error);
    let errorMessage = "Error desconocido";
    if (error.message === 'Verificación de reCAPTCHA fallida') {
      errorMessage = "Verificación de reCAPTCHA fallida. Por favor, inténtelo de nuevo.";
    } else if (error.code === "auth/email-already-in-use") {
      errorMessage = "Este correo ya está registrado.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "La contraseña es demasiado débil.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "El correo no es válido.";
    }

    return { success: false, message: errorMessage };
  }
};


const signInWithEmail = async (email, password, captchaToken) => {
  try {
    // Verifica el token de reCAPTCHA con el backend
    const response = await fetch('https://faas-sfo3-7872a1dd.doserverless.co/api/v1/web/fn-ab5e80b6-8190-4404-9b75-ead553014c5a/verify-recaptcha-package/send-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ captchaToken }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error('Verificación de reCAPTCHA fallida');
    }

    await setAuthPersistence();
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    let errorMessage;
    if (error.message === 'Verificación de reCAPTCHA fallida') {
      errorMessage = 'Por favor completa la verificación de reCAPTCHA.';
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "El usuario no existe.";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Demasiados intentos fallidos. Restablece tu contraseña o intenta más tarde.";
    } else if (error.code === "auth/invalid-credential") {
      errorMessage = "Correo o contraseña invalidos.";
    }

    return { success: false, message: errorMessage };
  }
};


const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Correo de restablecimiento de contraseña enviado." };
  } catch (error) {
    let errorMessage = "Error desconocido";
    if (error.code === "auth/user-not-found") {
      errorMessage = "No existe un usuario con este correo.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "El correo no es válido.";
    }
    return { success: false, message: errorMessage };
  }
};

// Actualizar la contraseña
const updatePasswordForUser = async (newPassword) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Error al cambiar la contraseña." };
    }
  }
  return { success: false, message: "Usuario no autenticado." };
};

// Accion para pedir la contraseña antes de borrar una tarjeta
const reauthenticateUser = async (password) => {
  const user = auth.currentUser;

  if (user) {
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      console.log("Usuario reautenticado");
      return { success: true };
    } catch (error) {
      console.error("Error en la reautenticación: ", error);
      return { success: false, message: error.message };
    }
  }
};
// Accion para google 

const reauthenticateWithGoogle = async () => {
  const user = auth.currentUser;
  const googleProvider = new GoogleAuthProvider();

  if (user) {
    try {
      await reauthenticateWithPopup(user, googleProvider);
      console.log("Usuario reautenticado con Google");
      return { success: true };
    } catch (error) {
      console.error("Error en la reautenticación con Google: ", error);
      return { success: false, message: error.message };
    }
  }
};

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
    const oneMinute = 24 * 60 * 60 * 1000; // 1 minuto en milisegundos

    if (currentTime - loginTime > oneMinute) {
      signOut(auth);
      console.log("Sesión expirada. Usuario ha sido desconectado.");
    }
  }
};

// Llama a la función cuando la app se inicie para verificar la sesión
checkSessionExpiration();

export { auth, signInWithGoogle, checkSessionExpiration, signUpWithEmail, updatePasswordForUser, signInWithEmail, resetPassword, reauthenticateUser, reauthenticateWithGoogle };
