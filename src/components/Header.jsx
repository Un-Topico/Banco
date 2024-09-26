import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from "../auth/authContext"; 

export const Header = () => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app);

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
          <div>
              <Link className="btn btn-outline-primary" to="/login">
            Login
          </Link>
            <Link className="btn btn-outline-primary" to="/crear-cuenta">
            Crear cuenta
          </Link>
          </div>
        
          
        )}
      </div>
    </div>
  </div>
</nav>

    </header>
  );
};
