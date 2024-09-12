import React, { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { downloadPDF } from "../utils/downloadPDF";
import { reauthenticateUser, reauthenticateWithGoogle } from "../auth/auth";
import { auth } from "../auth/auth"; // Importa auth desde tu archivo de autenticación
import { deleteCard } from "../auth/deleteCard";

export const AccountInfo = ({ accountData, selectedCard, transactions, onCardDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  
  const handleDelete = async () => {
    let result;

    // Verifica si el usuario inició sesión con correo y contraseña o con Google
    if (auth.currentUser.providerData[0].providerId === "password") {
      result = await reauthenticateUser(password); // Reautenticación con contraseña
    } else {
      result = await reauthenticateWithGoogle(); // Reautenticación con Google
    }
    console.log("Estado de autenticacion ",result)
    if (result.success) {
      await deleteCard(selectedCard.cardId); // Llama a la función para eliminar la tarjeta
      setShowModal(false)
      onCardDelete(); // Llama a la función para actualizar el estado en el componente padre
    } else {
        setShowModal(false)
        alert("Contraseña incorrecta o autenticacion fallida")
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Información de la Cuenta</Card.Title>
          <Card.Text>
            <p><strong>Tipo de cuenta:</strong> {accountData.accountType}</p>
            {selectedCard && (
              <>
                <p><strong>CLABE:</strong> {selectedCard.clabeNumber}</p>
                <p><strong>Saldo:</strong> ${selectedCard.balance} MXN</p>
              </>
            )}
          </Card.Text>
          {selectedCard && (
            <>
              <Button
                variant="primary"
                onClick={() => downloadPDF(accountData, transactions, selectedCard)}
              >
                Descargar Estado de Cuenta
              </Button>
              <Button
                variant="danger"
                className="ms-2"
                onClick={() => setShowModal(true)}
              >
                Eliminar Tarjeta
              </Button>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal para solicitar la contraseña antes de eliminar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {auth.currentUser.providerData[0].providerId === "password" ? (
              <Form.Group controlId="formPassword">
                <Form.Label>Ingresa tu contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
            ) : (
              <p>Reautentícate con tu cuenta de Google para eliminar esta tarjeta.</p>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Confirmar Eliminación
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};