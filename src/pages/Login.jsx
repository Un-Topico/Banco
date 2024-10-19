import React, { useEffect, useState, useRef } from "react";
import { signInWithGoogle, signInWithEmail } from "../auth/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import ReCAPTCHA from "react-google-recaptcha";  // Importa el componente de reCAPTCHA

export const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null); // Nuevo estado para almacenar el token de reCAPTCHA
  const recaptchaRef = useRef(); // Referencia para el componente de reCAPTCHA

  useEffect(() => {
    if (currentUser) {
      navigate('/inicio-usuario');
    }
  }, [currentUser, navigate]);

  const handleLoginWithEmail = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setErrorMessage("Por favor completa la verificación de reCAPTCHA.");
      return;
    }

    const result = await signInWithEmail(email, password, captchaToken); // Pasa el captchaToken al backend
    if (result.success) {
      navigate("/inicio-usuario");
    } else {
      setErrorMessage(result.message);
    }

    // Resetea el captcha después de la solicitud
    recaptchaRef.current.reset();
  };

  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleRecaptchaChange = (token) => {
    setCaptchaToken(token); // Guarda el token generado por reCAPTCHA
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

            {/* reCAPTCHA Widget */}
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lei2DoqAAAAANZjygCn2y8Z0r10NT_NqQAN06y5" // Reemplaza con tu clave de sitio
              onChange={handleRecaptchaChange}
            />

            <Button variant="primary" type="submit" className="w-100 mb-3 mt-3 ">
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
