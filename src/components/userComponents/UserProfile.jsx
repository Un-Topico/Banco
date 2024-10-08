import React, { useState } from "react";
import { reauthenticateUser, updatePasswordForUser } from "../../auth/auth"; // Funciones para reautenticar y actualizar contraseña
import { Row, Col, Button, Modal, Form, Alert, Card, Container } from "react-bootstrap";
import { ProfileImageUpload } from './ProfileImageUpload';
import { FaEdit, FaSave, FaKey, FaUser, FaPhoneAlt, FaEnvelope, FaMoneyBillWave } from "react-icons/fa"; // Íconos adicionales para mejorar la UI
import { getFirestore, doc, updateDoc } from "firebase/firestore"; // Firebase para actualizar el nombre
import { app } from "../../firebaseConfig"; // Configuración de Firebase

export const UserProfile = ({ accountData, currentUser, onImageUpdate, onNameUpdate, onPhoneUpdate, totalBalance }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo estado para confirmar la contraseña
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newName, setNewName] = useState(accountData.name);
  const [newPhone, setNewPhone] = useState(accountData.phoneNumber);

  // Verificar si el botón de cambiar contraseña debe estar habilitado
  const isPasswordChangeButtonDisabled = !currentPassword || !newPassword || !confirmPassword;

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(false);

    // Verificar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Confirmación antes de cambiar la contraseña
    const confirmChange = window.confirm("¿Estás seguro de que deseas cambiar tu contraseña?");
    if (!confirmChange) {
      return; // Salir si el usuario no confirma
    }

    try {
      const reauthResult = await reauthenticateUser(currentPassword);

      if (reauthResult.success) {
        const result = await updatePasswordForUser(newPassword);
        if (result.success) {
          setSuccess(true);
          setShowModal(false); // Cerrar el modal en caso de éxito
          // Resetear campos de contraseña
          setNewPassword("");
          setConfirmPassword("");
          setCurrentPassword(""); // Limpiar el input de contraseña actual
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
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    const db = getFirestore(app);
    const userDocRef = doc(db, "accounts", "account_" + currentUser.uid);

    try {
      await updateDoc(userDocRef, { name: newName });
      onNameUpdate(newName);
      setIsEditingName(false);
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
    }
  };

  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
  };

  const handlePhoneSave = async () => {
    const db = getFirestore(app);
    const userDocRef = doc(db, "accounts", "account_" + currentUser.uid);

    try {
      await updateDoc(userDocRef, { phoneNumber: "+52" + newPhone.trim() });
      onPhoneUpdate(newPhone);
      setIsEditingPhone(false);
    } catch (error) {
      console.error("Error al actualizar el número:", error);
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
              {/* Mostrar el nombre con opción de editar */}
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

              {/* Mostrar el teléfono con opción de editar */}
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

              {/* Mostrar email y tipo de cuenta */}
              <div className="mb-3">
                <FaEnvelope className="me-2" /> {currentUser.email}
              </div>
              <div className="mb-3">
                <FaUser className="me-2" /> Tipo de cuenta: {accountData.accountType}
              </div>
              <div className="mb-3">
                <FaMoneyBillWave className="me-2" /> Total del saldo en todas las tarjetas: ${totalBalance} MXN
              </div>

              {/* Botón para cambiar contraseña */}
              <Button variant="secondary" onClick={() => setShowModal(true)} className="mt-3">
                <FaKey className="me-1" /> Cambiar Contraseña
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
            disabled={isPasswordChangeButtonDisabled} // Deshabilitar el botón si faltan campos
          >
            Cambiar Contraseña
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};