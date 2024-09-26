import React, { useState } from "react";
import { resetPassword } from "../auth/auth"; // Importa la función de restablecer contraseña
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap"; // Importando componentes de React Bootstrap
import { FaEnvelope, FaKey } from "react-icons/fa"; // Importar íconos de react-icons

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const result = await resetPassword(email);
    if (result.success) {
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center mt-5">
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <div className="text-center ">
            <FaKey size={50} className="mb-3 text-primary" />
            <h2>Restablecer contraseña</h2>
          </div>
          {message && (
            <Alert
              variant={message.includes("Correo de restablecimiento") ? "success" : "danger"}
            >
              {message}
            </Alert>
          )}
          <Form onSubmit={handleResetPassword} className="p-4 border rounded shadow-sm">
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>
                <FaEnvelope className="me-2" /> Correo Electrónico
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduce tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Enviar correo de restablecimiento
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
