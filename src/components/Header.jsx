import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from "../auth/authContext"; 
import { FaBell } from 'react-icons/fa'; // Icono de campana
import ModalNotification from "./userComponents/ModalNotification";
import { getFirestore, query, collection, where, onSnapshot } from "firebase/firestore"; 

export const Header = () => {
  const { currentUser } = useAuth(); // Obtenemos el usuario actual del contexto
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Estado para el conteo de notificaciones no leídas
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore();

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "notifications"),
        where("ownerId", "==", currentUser.uid),
        where("read", "==", false)
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        // El tamaño del snapshot te da el conteo de las no leídas
        setUnreadCount(snapshot.size);
      });
  
      return () => unsubscribe(); // Cleanup para evitar fugas de memoria
    }
  }, [currentUser, db]);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor: "#4F98CA"}}>
        <div className="container-fluid fs-4">
          <Link className="navbar-brand" to="/">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Flogo_unto.png?alt=media&token=017bedc5-b76b-46b2-bdb3-24be1107872e"
              alt="Logo UnTópico"
              width="40"
              height="40"
              className="img-fluid"
            /> UnTópico
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/Personas">Personas</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/PyMes">PyMes</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">Nosotros</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/sucursales">Encuentra tu sucursal</Link>
              </li>
              {currentUser && (
                <li className="nav-item">
                  <Link className="btn btn-success position-relative me-md-2 btn-lg" to="/perfil">
                    Perfil
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              )}
            </ul>
            <div className="d-flex">
              {currentUser ? (
                <div>
                  <button className="btn btn-danger me-2" onClick={handleSignOut}>Logout</button>
                  <Link  className="btn btn-warning me-2" to="/pago-servicio">
                        Pagar servicio
                  </Link>

                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FaBell onClick={handleShow} style={{cursor: 'pointer', fontSize: '1.5rem'}} />
                    {unreadCount > 0 && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-10px',
                          background: 'red',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '2px 6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                     
                  <ModalNotification show={showModal} handleClose={handleClose} ownerId={currentUser.uid} />
                </div>
              ) : (
                <div>
                  <Link className="btn btn-success me-md-2" to="/login">Login</Link>
                  <Link className="btn btn-primary" to="/crear-cuenta">Crear cuenta</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
