import React, { useState } from "react";
import { reauthenticateUser, updatePasswordForUser } from "../../auth/auth"; // Funciones para reautenticar y actualizar contraseña
import { Row, Col, Button, Modal, Form, Alert, Card, Container } from "react-bootstrap";
import { ProfileImageUpload } from './ProfileImageUpload';
import { FaEdit, FaSave, FaKey, FaUser, FaPhoneAlt, FaEnvelope, FaMoneyBillWave } from "react-icons/fa";
import { updateUserName, updateUserPhone } from '../../api/userProfileApi'; // Funciones de la API

export const UserProfile = ({ accountData, currentUser, onImageUpdate, onNameUpdate, onPhoneUpdate, totalBalance }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newName, setNewName] = useState(accountData.name);
  const [newPhone, setNewPhone] = useState(accountData.phoneNumber);

  const isPasswordChangeButtonDisabled = !currentPassword || !newPassword || !confirmPassword;

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const confirmChange = window.confirm("¿Estás seguro de que deseas cambiar tu contraseña?");
    if (!confirmChange) return;

    try {
      const reauthResult = await reauthenticateUser(currentPassword);

      if (reauthResult.success) {
        const result = await updatePasswordForUser(newPassword);
        if (result.success) {
          setSuccess(true);
          setNewPassword("");
          setConfirmPassword("");
          setCurrentPassword("");
          setShowModal(false);
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

  const handleNameEdit = () => setIsEditingName(true);

  const handleNameSave = async () => {
    try {
      await updateUserName(currentUser.uid, newName);
      onNameUpdate(newName);
      setIsEditingName(false);
    } catch (error) {
      setError("Error al actualizar el nombre.");
    }
  };

  const handlePhoneEdit = () => setIsEditingPhone(true);

  const handlePhoneSave = async () => {
    try {
      await updateUserPhone(currentUser.uid, newPhone);
      onPhoneUpdate(newPhone);
      setIsEditingPhone(false);
    } catch (error) {
      setError("Error al actualizar el número de teléfono.");
    }
  };

  return (
    <Container className="my-4">
      <Card className="p-4 shadow-sm">
        <Card.Header> <FaUser className="me-2" /> Perfil de Usuario</Card.Header>
        <Card.Body>
          <Row className="align-items-center mb-4">
            {/* Imagen de perfil */}
            <Col md={4} className="text-center">
              <ProfileImageUpload currentImageUrl={accountData.profileImage} onImageUpdate={onImageUpdate} />
            </Col>

            {/* Información del perfil */}
            <Col md={8}>
              <div className="d-flex align-items-center mb-3">
                <FaUser className="me-2" />
                {isEditingName ? (
                  <Form.Control
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="me-2"
                    style={{ maxWidth: "200px" }}
                  />
                ) : (
                  <p className="h5 me-2 mb-0">{accountData.name}</p>
                )}
                <FaEdit onClick={handleNameEdit} style={{ cursor: "pointer" }} />
                {isEditingName && (
                  <Button variant="primary" size="sm" className="ms-2" onClick={handleNameSave}>
                    <FaSave className="me-1" /> Guardar
                  </Button>
                )}
              </div>

              <div className="d-flex align-items-center mb-3">
                <FaPhoneAlt className="me-2" />
                {isEditingPhone ? (
                  <Form.Control
                    type="number"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="me-2"
                    style={{ maxWidth: "200px" }}
                  />
                ) : (
                  <p className="h5 me-2 mb-0">{accountData.phoneNumber}</p>
                )}
                <FaEdit onClick={handlePhoneEdit} style={{ cursor: "pointer" }} />
                {isEditingPhone && (
                  <Button variant="primary" size="sm" className="ms-2" onClick={handlePhoneSave}>
                    <FaSave className="me-1" /> Guardar
                  </Button>
                )}
              </div>

              <div className="mb-3">
                <FaEnvelope className="me-2" /> {currentUser.email}
              </div>
              <div className="mb-3">
                <FaMoneyBillWave className="me-2" /> Total del saldo en todas las tarjetas: ${totalBalance} MXN
              </div>

              <Button variant="secondary" onClick={() => setShowModal(true)} className="mt-3">
                <FaKey className="me-1" /> Cambiar Contraseña
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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

            <Form.Group controlId="confirmPassword" className="mt-3">
              <Form.Label>Confirmar nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Button
            variant="primary"
            onClick={handlePasswordChange}
            disabled={isPasswordChangeButtonDisabled}
          >
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
