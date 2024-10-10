import React, { useState, useEffect, useRef } from "react";
import { signUpWithEmail, signInWithGoogle } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../auth/authContext";
import { app } from '../firebaseConfig';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import ReCAPTCHA from "react-google-recaptcha";
import TermsAndConditions from "../components/terminos/TermsAndConditions";

const db = getFirestore(app);

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkUserAccount = async () => {
      if (currentUser) {
        const accountsCollection = collection(db, "accounts");
        const q = query(accountsCollection, where("ownerId", "==", currentUser.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          navigate("/configurar-cuenta");
        } else {
          navigate("/perfil");
        }
      }
    };

    checkUserAccount();
  }, [currentUser, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
  
    if (!captchaToken) {
      setError("Por favor, complete el reCAPTCHA");
      return;
    }
  
    const result = await signUpWithEmail(email, password, captchaToken);
  
    if (result.success) {
      navigate("/configurar-cuenta");
    } else {
      setErrorMessage(result.message);
    }
  };
  

  const handleLoginWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
  };

  return (
    <Container className="d-flex justify-content-center mt-5" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <h2 className="mb-4 text-center">Registrar cuenta</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleRegister}>
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
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-4">
              <InputGroup>
                <InputGroup.Text><FaLock /></InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Check 
                type="checkbox" 
                label={
                  <span className="ms-2">
                    Acepto los <Button variant="link" className="p-0" onClick={() => setShowTerms(true)}>Términos y Condiciones</Button>
                  </span>
                }
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
            </Form.Group>
            
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6Lei2DoqAAAAANZjygCn2y8Z0r10NT_NqQAN06y5"
              onChange={handleCaptchaChange}
              className="mb-3"
            />

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3" 
              disabled={!termsAccepted}
            >
              Registrar
            </Button>

            <Button 
              variant="secondary" 
              className="w-100 d-flex align-items-center justify-content-center" 
              onClick={handleLoginWithGoogle} 
              disabled={!termsAccepted}
            >
              <FaGoogle className="me-2" /> Crear cuenta con Google
            </Button>
          </Form>
        </Col>
      </Row>

      <TermsAndConditions show={showTerms} onHide={() => setShowTerms(false)} onAccept={handleAcceptTerms} />
    </Container>
  );
};
