// src/components/ResetPassword.jsx
import React, { useState } from "react";
import { resetPassword } from "../auth/auth"; // Importa la función de restablecer contraseña

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const result = await resetPassword(email);
    if (result.success) {
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="container text-center w-50">
      <h2>Restablecer contraseña</h2>
      {message && <p style={{ color: message.includes("Correo de restablecimiento") ? "green" : "red" }}>{message}</p>}
      <form onSubmit={handleResetPassword}>
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
        <button type="submit" className="btn btn-primary">
          Enviar correo de restablecimiento
        </button>
      </form>
    </div>
  );
};
