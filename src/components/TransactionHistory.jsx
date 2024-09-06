import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../auth/authContex";
import { app } from "../firebaseConfig";
import { Table, Container, Row, Col, Form, Alert } from "react-bootstrap";

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // Estado para el filtro
  const [error, setError] = useState(null); // Estado para mostrar errores
  const { currentUser } = useAuth();

  const db = getFirestore(app);

  useEffect(() => {
    // Construir la consulta basada en el filtro seleccionado
    let q = query(
      collection(db, "transactions"),
      where("account_id", "==", `account_${currentUser.uid}`)
    );

    if (filter !== "all") {
      q = query(
        collection(db, "transactions"),
        where("account_id", "==", `account_${currentUser.uid}`),
        where("status", "==", filter)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ ...doc.data(), id: doc.id });
        });

        // Ordenar por fecha de transacción (más reciente primero)
        transactionsData.sort((a, b) => b.transaction_date.toDate() - a.transaction_date.toDate());

        setTransactions(transactionsData);
        setError(null); // Limpiar el error si la consulta tiene éxito
      },
      (error) => {
        console.error("Error al obtener transacciones:", error);
        setError("Hubo un error al obtener las transacciones.");
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser.uid, db, filter]); // Se añade 'filter' como dependencia

  return (
    <Container className="text-center mt-5">
      <h2>Historial de Transacciones</h2>

      {/* Menú de selección de filtro */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form.Group controlId="filter">
            <Form.Label>Filtrar por tipo</Form.Label>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="sent">Realizadas</option>
              <option value="received">Recibidas</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {transactions.length === 0 ? (
        <p>No se encontraron transacciones.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID de Transacción</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.transaction_id}</td>
                <td>{transaction.status}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>{transaction.transaction_date.toDate().toLocaleString()}</td>
                <td>{transaction.description || "Sin descripción"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};
