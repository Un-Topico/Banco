import React,{useEffect} from "react";
import { signInWithGoogle } from "../auth/auth"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContex";
export const  Login=()=> {
  const {currentUser} = useAuth();
  const navigate = useNavigate();

  useEffect(()=> {
    if(currentUser) {
      navigate('/perfil') 
    }
  },[])

  const handleLogin = async () => {
    await signInWithGoogle();
    navigate("/perfil");
  };

  return (
    <div className="container text-center ">
      <h2>Iniciar sesión</h2>
      <button onClick={handleLogin} className="btn btn-primary">
        Iniciar sesión con Google
      </button>
    </div>
  );
}

