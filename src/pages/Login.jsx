import React, { useEffect } from "react";
import { signInWithGoogle } from "../auth/auth"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContex";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAccount = async () => {
      if (currentUser) {
        // Verificar si el usuario ya tiene una cuenta
        const accountsCollection = collection(db, "accounts");
        const q = query(accountsCollection, where("ownerId", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Si no tiene cuenta, redirigir a la página de crear cuenta
          navigate("/crear-cuenta");
        } else {
          // Si ya tiene cuenta, redirigir al perfil
          navigate("/perfil");
        }
      }
    };

    checkUserAccount();
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="container text-center">
      <h2>Iniciar sesión</h2>
      <button onClick={handleLogin} className="btn btn-primary">
        Iniciar sesión con Google
      </button>
    </div>
  );
};
