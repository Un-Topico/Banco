import React, { useState } from "react";
import { reauthenticateUser, updatePasswordForUser } from "../auth/auth"; // Funciones para reautenticar y actualizar contraseña
import { Row, Col, Button, Modal, Form, Alert } from "react-bootstrap";
import { ProfileImageUpload } from './ProfileImageUpload';
import { FaEdit } from "react-icons/fa"; // Ícono de edición
import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Firebase para actualizar el nombre
import { app } from "../firebaseConfig"; // Configuración de Firebase

export const UserProfile = ({ accountData, currentUser, onImageUpdate, onNameUpdate }) => { 
  // Añadí onNameUpdate que será pasado desde el componente padre
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false); // Nuevo estado para editar el nombre
  const [newName, setNewName] = useState(accountData.name); // Guardar el nombre editado

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);

    try {
      const reauthResult = await reauthenticateUser(currentPassword);

      if (reauthResult.success) {
        const result = await updatePasswordForUser(newPassword);
        if (result.success) {
          setSuccess(true);
          setShowModal(false); // Cerrar el modal en caso de éxito
        } else {
          setError(result.message);
        }
      } else {
        setError(reauthResult.message);
      }
    } catch (error) {
      setError("Error al cambiar la contraseña.");
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true); // Habilitar edición del nombre
  };

  const handleNameSave = async () => {
    const db = getFirestore(app);
    const userDocRef = doc(db, "accounts", "account_" + currentUser.uid);

    try {
      await updateDoc(userDocRef, { name: newName }); // Actualizar el nombre en Firestore
      onNameUpdate(newName); // Llamar a la función para actualizar el nombre en el estado global
      setIsEditingName(false); // Desactivar el modo de edición
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
    }
  };

  return (
    <Row className="text-center mb-4">
      <Col>
        <h2>Perfil</h2>
        <ProfileImageUpload currentImageUrl={accountData.profileImage} onImageUpdate={onImageUpdate} />

        {/* Mostrar el nombre con opción de editar */}
        <div className="d-flex justify-content-center align-items-center">
          {isEditingName ? (
            <Form.Control
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="me-2"
              style={{ maxWidth: "200px" }}
            />
          ) : (
            <p className="h4 me-2">Bienvenido, {accountData.name}</p>
          )}
          <FaEdit onClick={handleNameEdit} style={{ cursor: "pointer" }} />

          {isEditingName && (
            <Button variant="primary" size="sm" className="ms-2" onClick={handleNameSave}>
              Guardar
            </Button>
          )}
        </div>

        <p className="text-muted">{currentUser.email}</p>

        <Button variant="secondary" onClick={() => setShowModal(true)}>
          Cambiar Contraseña
        </Button>

        {/* Modal para cambiar la contraseña */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cambiar Contraseña</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="currentPassword">
                <Form.Label>Contraseña actual</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mt-3">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {success && <Alert variant="success" className="mt-3">Contraseña actualizada exitosamente</Alert>}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handlePasswordChange}>
              Cambiar Contraseña
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
};
