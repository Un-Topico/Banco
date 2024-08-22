import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            MiTienda
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Productos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Perfil
                </Link>
              </li>
            </ul>
            <div className="d-flex">
              <Link className="btn btn-outline-success me-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-outline-primary" to="/signup">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

