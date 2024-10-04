import React, { useState } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import { downloadPDF } from "../utils/downloadPDF";
import { reauthenticateUser, reauthenticateWithGoogle } from "../auth/auth";
import { auth } from "../auth/auth"; // Importa auth desde tu archivo de autenticación
import { deleteCard } from "../auth/deleteCard";
import UpdateCardModal from './UpdateCardModal'; // Importar el modal de actualización de tarjeta
import { FaDownload, FaTrashAlt, FaEdit, FaIdCard } from "react-icons/fa";

export const AccountInfo = ({ accountData, selectedCard, transactions, onCardDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Estado para el modal de actualización

  const handleDelete = async () => {
    let result;

    // Verifica si el usuario inició sesión con correo y contraseña o con Google
    if (auth.currentUser.providerData[0].providerId === "password") {
      result = await reauthenticateUser(password); // Reautenticación con contraseña
    } else {
      result = await reauthenticateWithGoogle(); // Reautenticación con Google
    }

    if (result.success) {
      await deleteCard(selectedCard.cardId); // Llama a la función para eliminar la tarjeta
      setShowModal(false);
      onCardDelete(); // Llama a la función para actualizar el estado en el componente padre
    } else {
      setShowModal(false);
      alert("Contraseña incorrecta o autenticación fallida");
    }
  };

  return (
    <>
        <Card.Body>
          <h2>Información de la tarjeta <FaIdCard /></h2>
          <Card.Text>
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
                <FaDownload className="me-2" /> Descargar Estado de Cuenta {/* Icono de descarga */}
              </Button>
              <Button
                variant="warning"
                className="ms-2"
                onClick={() => setShowUpdateModal(true)} // Abrir el modal de actualización
              >
                <FaEdit className="me-2" /> Actualizar Tarjeta {/* Icono de edición */}
              </Button>
              <Button
                variant="danger"
                className="ms-2"
                onClick={() => setShowModal(true)}
              >
                <FaTrashAlt className="me-2" /> Eliminar Tarjeta {/* Icono de eliminar */}
              </Button>
             
            </>
          )}
        </Card.Body>

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

      {/* Modal para actualizar tarjeta */}
      {selectedCard && (
        <UpdateCardModal
          show={showUpdateModal}
          handleClose={() => setShowUpdateModal(false)}
          cardData={selectedCard}
          onCardUpdated={() => setShowUpdateModal(false)} // Refresca después de la actualización
        />
      )}
    </>
  );
};
