// src/pages/Login.js
import React from "react";
import { signInWithGoogle } from "../auth"; // Importamos la función desde auth.js
import { useNavigate } from "react-router-dom";

export const  Login=()=> {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await signInWithGoogle();
    navigate("/profile");
  };

  return (
    <div className="login-page">
      <h2>Iniciar sesión</h2>
      <button onClick={handleLogin} className="btn btn-primary">
        Iniciar sesión con Google
      </button>
    </div>
  );
}

