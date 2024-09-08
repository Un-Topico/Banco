import React, { useState,useEffect } from "react";
import { signUpWithEmail, signInWithGoogle } from "../auth/auth"; // Importa la función de registro de cuentas
import { useNavigate } from "react-router-dom";

import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/authContext";
import {app} from '../firebaseConfig'
const db = getFirestore(app);
export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");  // Para error de validación de contraseña 
  const [errorMessage, setErrorMessage] = useState("");  // Para errores de Firebase
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkUserAccount = async () => {
      if (currentUser) {
        // Verificar si el usuario ya tiene una cuenta
        const accountsCollection = collection(db, "accounts");
        const q = query(accountsCollection, where("ownerId", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Si no tiene cuenta, redirigir a la página de crear cuenta
          navigate("/configurar-cuenta");
        } else {
          // Si ya tiene cuenta, redirigir al perfil
          navigate("/perfil");
        }
      }
    };

    checkUserAccount();
  }, [currentUser, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Intentar registrar al usuario
    const result = await signUpWithEmail(email, password);
    
    if (result.success) {
      // Si el registro es exitoso, redirige a configurar cuenta o al perfil
      navigate("/configurar-cuenta");
    } else {
      // Muestra el mensaje de error si ocurre un error de Firebase
      setErrorMessage(result.message);
    }
  };
  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="container text-center w-50">
      <h2>Registrar cuenta</h2>

      {/* Muestra errores de validación */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Muestra errores desde Firebase */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Registrar
        </button>
        
      <button onClick={handleLoginWithGoogle} className="btn btn-secondary">
        Crear cuenta con Google
      </button>
      </form>
    </div>
  );
};
