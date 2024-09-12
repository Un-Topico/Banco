import React, { useEffect, useState } from "react";
import { signInWithGoogle, signInWithEmail } from "../auth/auth"; // Importa la función de inicio de sesión por correo
import { useNavigate, Link } from "react-router-dom"; // Importa Link para navegación
import { useAuth } from "../auth/authContext";
import { Container, Row, Col, Form, Button, Alert,InputGroup } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';

export const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (currentUser) {
      navigate('/perfil');
    }
  }, [currentUser, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();
    const result = await signInWithEmail(email, password);
    if (result.success) {
      navigate("/perfil"); // Redirigir al perfil si el inicio es exitoso
    } else {
      setErrorMessage(result.message); // Mostrar el mensaje de error
    }
  };

  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <Container className="d-flex justify-content-center mt-5" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <h2 className="mb-4 text-center">Iniciar sesión</h2>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleLoginWithEmail}>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text><FaEnvelope /></InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text><FaLock /></InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Iniciar sesión con correo
            </Button>
          </Form>

          <p className="mt-3 text-center">
            ¿Olvidaste tu contraseña? <Link to="/restablecer-contraseña">Restablecer</Link>
          </p>

          <hr />

          <Button 
            variant="secondary" 
            className="w-100 d-flex align-items-center justify-content-center" 
            onClick={handleLoginWithGoogle}
          >
            <FaGoogle className="me-2" /> Iniciar sesión con Google
          </Button>
        </Col>
      </Row>
    </Container>
  );
};
