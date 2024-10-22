import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { getUserAccount, subscribeToUserCards } from "../api/profileApi";
import { UserProfile } from "../components/userComponents/UserProfile";

export const EditarPerfil = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData, setAccountData] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0); // Estado para el balance total
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        // Obtener datos de la cuenta
        const account = await getUserAccount(currentUser.uid);
        if (!account) {
          navigate("/crear-cuenta");
          return;
        }
        setAccountData(account);

        // Suscribirse a las tarjetas del usuario
        const unsubscribe = subscribeToUserCards(currentUser.uid, ({ total }) => {
          setTotalBalance(total);
        });

        // Cleanup: elimina el listener cuando el componente se desmonte
        return () => unsubscribe();
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        setError("Hubo un error al cargar los datos del usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  const handleImageUpdate = (newImageUrl) => {
    setAccountData((prevData) => ({ ...prevData, profileImage: newImageUrl }));
  };

  const handleNameUpdate = (newName) => {
    setAccountData((prevData) => ({
      ...prevData,
      name: newName,
    }));
  };

  const handlePhoneUpdate = (newPhone) => {
    setAccountData((prevData) => ({
      ...prevData,
      phoneNumber: newPhone,
    }));
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <UserProfile
      accountData={accountData}
      currentUser={currentUser}
      onImageUpdate={handleImageUpdate}
      onNameUpdate={handleNameUpdate}
      onPhoneUpdate={handlePhoneUpdate}
      totalBalance={totalBalance}
    />
  );
};
