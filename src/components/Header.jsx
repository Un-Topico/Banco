import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { FaBell, FaSignOutAlt, FaMoneyBillAlt } from "react-icons/fa"; // Importación de iconos adicionales
import { useAuth } from "../auth/authContext";
import ModalNotification from "./userComponents/ModalNotification";
import {
  getFirestore,
  query,
  collection,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import "../styles/header.css";

export const Header = () => {
  const { currentUser } = useAuth();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userAccount, setUserAccount] = useState(null); // Estado para los datos de la cuenta del usuario
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
        setUnreadCount(snapshot.size);
      });

      // Obtener datos de la cuenta del usuario
      const getUserAccount = async (ownerId) => {
        const accountsCollection = collection(db, "accounts");
        const accountQuery = query(
          accountsCollection,
          where("ownerId", "==", ownerId)
        );
        const accountSnapshot = await getDocs(accountQuery);

        if (!accountSnapshot.empty) {
          setUserAccount(accountSnapshot.docs[0].data());
        }
      };

      getUserAccount(currentUser.uid);

      return () => unsubscribe(); // Cleanup para evitar fugas de memoria

    }
  }, [currentUser, db]);

  return (
    <header className="header">
      <div className="logo">
        <Link className="navbar-brand" to="/">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/img%2Flogo_unto.png?alt=media&token=017bedc5-b76b-46b2-bdb3-24be1107872e"
            alt="Logo UnTópico"
            width="40"
            height="40"
            className="img-fluid"
          />
          UnTópico
        </Link>
      </div>
      <nav className="nav">
        <div className="dropdown">
          <button className="dropbtn">Enterprise</button>
          <div className="dropdown-content">
            <Link to="/Personas">Personas</Link>
            <Link to="/PyMes">PyMes</Link>
            <Link to="/About">Nosotros</Link>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropbtn">Sucursales</button>
          <div className="dropdown-content">
            <Link to="#">Quéretaro</Link>
            <Link to="#">Ciudad de México</Link>
            <Link to="#">Guanajuato</Link>
          </div>
        </div>
        
      </nav>

      <div className="d-flex align-items-center">
        {currentUser ? (
          <div className="d-flex align-items-center">
            {/* Icono de Logout */}
            <FaSignOutAlt
              onClick={handleSignOut}
              style={{
                cursor: "pointer",
                fontSize: "1.5rem",
                color: "#dc3545", // Color rojo como el botón de "Logout"
                marginRight: "15px",
              }}
              title="Cerrar sesión"
            />

            {/* Icono de Pagar Servicio */}
            <Link to="/pago-servicio">
              <FaMoneyBillAlt
                style={{
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  color: "#ffc107", // Color amarillo como el botón de "Pagar servicio"
                  marginRight: "15px",
                }}
                title="Pagar servicio"
              />
            </Link>

            {/* Icono de Notificaciones */}
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaBell
                onClick={handleShow}
                style={{
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  marginRight: "10px",
                }}
                title="Notificaciones"
              />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "3px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.8rem",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Modal de notificaciones */}
            <ModalNotification
              show={showModal}
              handleClose={handleClose}
              ownerId={currentUser.uid}
            />

            {/* Icono de Usuario */}
            <div
              className="user-icon-wrapper"
              onMouseEnter={() => setShowProfileCard(true)}
              onMouseLeave={() => setShowProfileCard(false)}
            >
              <div className="user-icon">
                {userAccount?.profileImage ? (
                  <a href="/inicio-usuario">
                    <img
                      src={userAccount.profileImage}
                      alt="User Profile"
                      width="40"
                      height="40"
                      style={{ borderRadius: "50%" }}
                    />
                  </a>
                ) : (
                  <span className="user-icon-content">
                    {currentUser ? currentUser.displayName.charAt(0) : "T"}
                  </span>
                )}
              </div>
              {showProfileCard && currentUser && userAccount && (
                <div className="profile-card">
                  <div className="profile-card-content">
                    {userAccount?.profileImage ? (
                      <a href="/inicio-usuario">
                        <img
                          src={userAccount.profileImage}
                          alt="User Profile"
                          width="40"
                          height="40"
                          style={{ borderRadius: "50%" }}
                        />
                      </a>
                    ) : (
                      <span className="user-icon-content">
                        {currentUser ? currentUser.displayName.charAt(0) : "T"}
                      </span>
                    )}
                    <p>{currentUser.displayName}</p>
                    <p>{currentUser.email}</p>
                    <p>
                      {userAccount.phoneNumber || "No phone number available"}
                    </p>
                    <Link to="/editar-perfil" className="edit-profile">
                      Editar perfil
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Link className="btn btn-success me-md-2" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary" to="/crear-cuenta">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
