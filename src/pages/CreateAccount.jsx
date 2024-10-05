import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { CreditCardForm } from "../components/cardComponents/CreditCardForm";
import { Form, Button, Container, Card } from "react-bootstrap";
import { checkUserAccount } from "../auth/checkUserAccount";

export const CreateAccount = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("Ahorro");
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [status, setStatus] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
    } else {
      const checkUser = async (currentUser) => {
        const check = await checkUserAccount(currentUser);
        if (check) navigate("/perfil");
      };
      checkUser(user); // Solo se ejecuta si hay un usuario

      // Verificar si ya tiene una tarjeta registrada
      const checkCard = async (userUid) => {
        const cardsQuery = query(
          collection(db, "cards"),
          where("ownerId", "==", userUid)
        );
        const querySnapshot = await getDocs(cardsQuery);

        if (!querySnapshot.empty) {
          setIsCardSaved(true);
          setStatus(false)
        }
      };
      checkCard(user.uid);
    }
  }, [auth.currentUser, navigate,db]);

  useEffect(() => {
    // Habilita el botón si la tarjeta ha sido guardada y el nombre está lleno
    if (isCardSaved && name) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [isCardSaved, name]);

  const createAccount = async (userUid, userEmail) => {
    try {
      // Identificador único para la cuenta
      const accountId = `account_${userUid}`;

      const accountData = {
        accountId: accountId,
        accountType: accountType,
        name: name,
        balance: 100, // Saldo inicial
        ownerId: userUid,
        email: userEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const accountsCollection = collection(db, "accounts");
      const accountDocRef = doc(accountsCollection, accountId);

      await setDoc(accountDocRef, accountData);

      navigate("/perfil"); // Redirige al perfil después de crear la cuenta
    } catch (error) {
      console.error("Error al crear la cuenta:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      console.error("No hay usuario autenticado.");
      return;
    }

    await createAccount(user.uid, user.email);
  };

  return (
    <Container className="my-4">
      <Card className="p-4 shadow-sm">
        <Card.Title as="h2" className="mb-4">
          Crear Cuenta
        </Card.Title>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label column sm={4}>
              Nombre de usuario
            </Form.Label>
            <Form.Control
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
            />
          </Form.Group>

          <Form.Group controlId="accountType" className="mb-3">
            <Form.Label>Tipo de Cuenta</Form.Label>
            <Form.Control
              as="select"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="Ahorro">Ahorro</option>
              <option value="Corriente">Corriente</option>
            </Form.Control>
          </Form.Group>
        </Form>
        {/* Mostrar el formulario de tarjeta solo si no está guardada */}
        
        {status ? <CreditCardForm onCardSaved={setIsCardSaved} /> :<p class="text-success">Tarjeta previamente registada</p>}

        <Button
          variant="primary"
          type="button"
          disabled={isButtonDisabled}
          className="mt-3"
          onClick={handleSubmit}
        >
          Crear Cuenta
        </Button>
      </Card>
    </Container>
  );
};
