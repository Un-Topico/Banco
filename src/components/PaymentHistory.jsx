import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Card, ListGroup, Spinner, Container, Form } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";

export const PaymentHistory = ({ currentUser }) => {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCards = async () => {
      const db = getFirestore(app);

      // Obtener las tarjetas del usuario
      const cardsRef = collection(db, "cards");
      const cardsQuery = query(cardsRef, where("ownerId", "==", currentUser.uid));
      const cardsSnapshot = await getDocs(cardsQuery);

      const userCards = cardsSnapshot.docs.map((doc) => ({
        cardId: doc.id,
        ...doc.data(),
      }));

      setCards(userCards);
      setLoading(false);
    };

    fetchUserCards();
  }, [currentUser]);

  const fetchPurchaseHistory = async (cardId) => {
    const db = getFirestore(app);
    setLoading(true);

    // Obtener las transacciones de la tarjeta seleccionada
    const transactionsRef = collection(db, "transactions");
    const purchaseQuery = query(
      transactionsRef,
      where("transaction_type", "==", "compra"),
      where("card_id", "==", cardId)
    );

    const transactionsSnapshot = await getDocs(purchaseQuery);
    const purchasesData = transactionsSnapshot.docs.map((doc) => doc.data());

    // Ordenar las transacciones por fecha (de más reciente a más antigua)
    purchasesData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());

    setTransactions(purchasesData);
    setLoading(false);
  };

  const handleCardSelection = (e) => {
    const cardId = e.target.value;
    setSelectedCardId(cardId);
    fetchPurchaseHistory(cardId);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando historial de compras...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Historial de Compras</h2>
      
      {/* Selección de tarjetas */}
      {cards.length === 0 ? (
        <p className="text-center">No tienes tarjetas registradas.</p>
      ) : (
        <Form.Group controlId="cardSelection" className="mb-3">
          <Form.Label>Selecciona una tarjeta</Form.Label>
          <Form.Control as="select" onChange={handleCardSelection} value={selectedCardId || ""}>
            <option value="">-- Selecciona una tarjeta --</option>
            {cards.map((card) => (
              <option key={card.cardId} value={card.cardId}>
                {card.cardId} - Saldo: ${card.balance}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      {/* Historial de compras */}
      {selectedCardId && transactions.length === 0 && !loading && (
        <p className="text-center">No hay transacciones para esta tarjeta.</p>
      )}

      {transactions.map((transaction) => (
        <Card key={transaction.transaction_id} className="mb-3 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>
              <FaShoppingCart /> Compra
            </span>
            <small className="text-muted">
              {new Date(transaction.transaction_date.seconds * 1000).toLocaleString()}
            </small>
          </Card.Header>
          <ListGroup variant="flush">
            <ListGroup.Item><strong>Monto:</strong> ${transaction.amount}</ListGroup.Item>
            <ListGroup.Item><strong>Descripción:</strong> {transaction.description}</ListGroup.Item>
            <ListGroup.Item><strong>Categoría:</strong> {transaction.category}</ListGroup.Item>
            <ListGroup.Item>
              <strong>Status:</strong>{" "}
              <span className={transaction.status === "pagado" ? "text-success" : "text-danger"}>
                {transaction.status}
              </span>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      ))}
    </Container>
  );
};
