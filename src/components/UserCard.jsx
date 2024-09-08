import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";
import CardComponent from "./Card";
import { Container, Row, Alert, Card, Col } from "react-bootstrap";
import { AddCardModal } from "./AddCardModal";

const UserCards = ({ onSelectCard }) => {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const { currentUser } = useAuth();

  const [modalShow, setModalShow] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const q = query(
      collection(db, "cards"),
      where("ownerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cardsData = [];
        querySnapshot.forEach((doc) => {
          cardsData.push({ ...doc.data(), id: doc.id });
        });
        setCards(cardsData);
        setError(null);
      },
      (error) => {
        console.error("Error al obtener las tarjetas:", error);
        setError("Hubo un error al obtener las tarjetas.");
      }
    );

    return () => unsubscribe();
  }, [currentUser.uid, db]);

  const handleCardClick = (card) => {
    setActiveCard(card);
    if (onSelectCard) {
      onSelectCard(card);
    }
  };

  const handleShowModal = () => setModalShow(true);
  const handleCloseModal = () => setModalShow(false);

  return (
    <Container className="text-center mt-4 mb-4">
      <h2>Mis Tarjetas</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {cards.length === 0 ? (
        <Card.Body>
          <Card.Title>No tienes tarjetas agregadas.</Card.Title>
          <Card.Text onClick={handleShowModal}>
            <button className="btn btn-link">Añadir Nueva Tarjeta</button>
          </Card.Text>
        </Card.Body>
      ) : (
        <Row>
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onClick={handleCardClick}
              isActive={activeCard === card}
            />
          ))}
          <Col md={4} className="mb-4">
            <Card style={{ cursor: 'pointer' }} onClick={handleShowModal}>
              <Card.Body>
                <Card.Text>
                  <button className="btn btn-link">Añadir Nueva Tarjeta</button>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Solo una instancia de AddCardModal */}
      <AddCardModal show={modalShow} onHide={handleCloseModal} />
    </Container>
  );
};

export default UserCards;
