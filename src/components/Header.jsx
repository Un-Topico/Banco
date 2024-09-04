import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from "../auth/authContex"; 

export const Header = () => {
  const { currentUser } = useAuth(); // Obtemos el usuario actual del contexto
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige a la página de inicio después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header>
<nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor: "#50D890"}}>
  <div className="container-fluid">
    <a class="navbar-brand" href="/">
      <img src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Flogo_unto.png?alt=media&token=017bedc5-b76b-46b2-bdb3-24be1107872e" 
      alt="Logo UnTópico" 
      width="40" 
      height="40" 
      class="img-fluid"/>
      UnTópico
    </a>
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link active" aria-current="page" to="/">
            Personas
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/products">
            PyMes
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/about">
            Nosotros
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/contact">
            Encuentra tu sucursal
          </Link>
        </li>
        {currentUser && (
          <li className="nav-item">
            <Link className="nav-link" to="/perfil">
              Perfil
            </Link>
          </li>
        )}
      </ul>
      <div className="d-flex">
        {currentUser ? (
          <button className="btn btn-outline-success me-2" onClick={handleSignOut}>
            Logout
          </button>
        ) : (
          <Link className="btn btn-outline-primary" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  </div>
</nav>

    </header>
  );
};
