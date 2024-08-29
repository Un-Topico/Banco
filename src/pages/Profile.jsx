import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
export const Profile=()=> {
  const { currentUser } = useAuth();
  return (
    <div className="container text-center">
      <h2>Perfil</h2>
      <FaUserCircle size={50} />       <p>Bienvenido, {currentUser.displayName}</p>

    </div>
  );
}

