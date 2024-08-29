import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../auth/authContex";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export const Profile=()=> {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  useEffect(()=> {
    if(!currentUser){
      navigate('login')
    }
  })
  return (
    <div className="container text-center">
      <h2>Perfil</h2>
      <FaUserCircle size={50} />       <p>Bienvenido, {currentUser.displayName}</p>

    </div>
  );
}

