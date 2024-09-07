// src/components/Login.jsx
import React, { useEffect, useState } from "react";
import { signInWithGoogle, signInWithEmail } from "../auth/auth"; // Importa la función de inicio de sesión por correo
import { useNavigate, Link } from "react-router-dom"; // Importa Link para navegación
import { useAuth } from "../auth/authContex";
import { getFirestore} from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export const Login = () => {
  useEffect(()=>{
    if(currentUser){
      navigate('/perfil')
    }
  },[])
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


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
