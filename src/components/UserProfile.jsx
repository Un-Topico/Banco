import React, { useState } from "react";
import { reauthenticateUser, updatePasswordForUser } from "../auth/auth"; // Funciones para reautenticar y actualizar contraseña
import { Row, Col, Button, Modal, Form, Alert } from "react-bootstrap";
import {ProfileImageUpload} from './ProfileImageUpload'
export const UserProfile = ({ accountData, currentUser, onImageUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);
    
    try {
      // Reautenticar al usuario antes de actualizar la contraseña
      const reauthResult = await reauthenticateUser(currentPassword);
      
      if (reauthResult.success) {
        // Cambiar la contraseña
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

  return (
    <Row className="text-center mb-4">
      <Col>
        <h2>Perfil</h2>
        <ProfileImageUpload currentImageUrl={accountData.profileImage} onImageUpdate={onImageUpdate}/>
        <p className="h4">Bienvenido, {accountData.name}</p>
        <p className="text-muted">{currentUser.email}</p>

        {/* Botón para abrir el modal */}
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
