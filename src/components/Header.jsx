import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth"; // Import the signOut function from firebaseConfig
import { app } from "../firebaseConfig";

export const Header = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const auth = getAuth(app); // Initialize the auth object
  const handleSignOut = async () => {
    try {
      signOut(auth).then(()=>{
        navigate("/");
      }) // Call the signOut function
      // Redirect or perform any other action after successful sign out
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Un Topic
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
              <button className="btn btn-outline-success me-2" onClick={handleSignOut}>
                Logout
              </button>
              <Link className="btn btn-outline-primary" to="/login">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

