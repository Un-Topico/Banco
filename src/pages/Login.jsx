// src/components/Login.jsx
import React, { useEffect, useState } from "react";
import { signInWithGoogle, signInWithEmail } from "../auth/auth"; // Importa la función de inicio de sesión por correo
import { useNavigate, Link } from "react-router-dom"; // Importa Link para navegación
import { useAuth } from "../auth/authContex";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    const result = await signInWithEmail(email, password);
    if (result.success) {
      navigate("/perfil"); // Redirigir al perfil si el inicio es exitoso
    } else {
      setErrorMessage(result.message); // Mostrar el mensaje de error
    }
  };

  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="container text-center w-50">
      <h2>Iniciar sesión</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={handleLoginWithEmail}>
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
        <button type="submit" className="btn btn-primary">
          Iniciar sesión con correo
        </button>
      </form>

      <p className="mt-3">
        ¿Olvidaste tu contraseña? <Link to="/restablecer-contraseña">Restablecer</Link>
      </p>

      <hr />

      <button onClick={handleLoginWithGoogle} className="btn btn-secondary">
        Iniciar sesión con Google
      </button>
    </div>
  );
};
