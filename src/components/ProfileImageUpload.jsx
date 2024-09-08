import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";
import { Button, Spinner, Image } from "react-bootstrap";

export const ProfileImageUpload = ({ currentImageUrl, onImageUpdate }) => {
  const { currentUser } = useAuth();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(currentImageUrl);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [defaultImageUrl, setDefaultImageUrl] = useState(null);

  useEffect(() => {
    // Obtener la imagen por defecto de Firebase Storage
    const fetchDefaultImage = async () => {
      const storage = getStorage(app);
      const defaultImageRef = ref(storage, "profileImages/default-profile.png"); // Cambia esta ruta si es necesario
      const url = await getDownloadURL(defaultImageRef);
      setDefaultImageUrl(url);
    };

    if (!currentImageUrl) {
      fetchDefaultImage();
    }
  }, [currentImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Validar tamaño de imagen (máximo 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setButtonVisible(true); // Mostrar botón para subir cuando se selecciona una imagen
  };

  const handleUpload = async () => {
    if (!image) return;

    setUploading(true);
    const storage = getStorage(app);
    const storageRef = ref(storage, `profileImages/${currentUser.uid}`);

    try {
      // Subir la imagen a Firebase Storage
      await uploadBytes(storageRef, image);

      // Obtener la URL de descarga de la imagen
      const imageUrl = await getDownloadURL(storageRef);

      // Guardar la URL en Firestore
      const db = getFirestore(app);
      const userDoc = doc(db, "accounts", `account_${currentUser.uid}`);
      await updateDoc(userDoc, { profileImage: imageUrl });

      // Notificar al componente padre que la imagen ha sido actualizada
      onImageUpdate(imageUrl);

      // Ocultar botón de subir imagen
      setButtonVisible(false);
      alert("Imagen de perfil actualizada correctamente.");
    } catch (error) {
      console.error("Error al subir la imagen: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-center">
      <div
        className="position-relative d-inline-block"
        onMouseEnter={() => setButtonVisible(true)}
        onMouseLeave={() => !image && setButtonVisible(false)}
        style={{ width: "150px", height: "150px" }}
      >
        <Image
          src={imagePreview || defaultImageUrl}
          alt="Profile"
          roundedCircle
          fluid
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="d-none"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            display: buttonVisible ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            borderRadius: "50%",
          }}
        >
          Cambiar Imagen
        </label>
      </div>

      {buttonVisible && (
        <Button
          onClick={handleUpload}
          variant="primary"
          className="mt-3"
          disabled={uploading}
        >
          {uploading ? <Spinner animation="border" size="sm" /> : "Subir Imagen"}
        </Button>
      )}
    </div>
  );
};

