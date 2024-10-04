import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Table, Container, Row, Col, Form, Alert, Pagination } from "react-bootstrap";

export const TransactionHistory = ({ selectedCardId }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // Estado para el filtro de tipo
  const [startDate, setStartDate] = useState(""); // Estado para la fecha de inicio
  const [endDate, setEndDate] = useState(""); // Estado para la fecha de fin
  const [error, setError] = useState(null); // Estado para mostrar errores
  const [currentPage, setCurrentPage] = useState(1); // Estado para la pagina actual
  const transactionsPerPage = 5; // Definir el numero de transacciones por pagina
  const db = getFirestore(app);

  useEffect(() => {
    // No hacer nada si no hay una tarjeta seleccionada
    if (!selectedCardId) {
      setTransactions([]);
      return;
    }

    // Construir la consulta basada en los filtros seleccionados
    let q = query(
      collection(db, "transactions"),
      where("card_id", "==", selectedCardId)
    );

    if (filter !== "all") {
      q = query(
        q,
        where("status", "==", filter)
      );
    }

    if (startDate && endDate) {
      q = query(
        q,
        where("transaction_date", ">=", new Date(startDate)),
        where("transaction_date", "<=", new Date(endDate))
      );
    }

    // Agregar ordenación por fecha
    q = query(q, orderBy("transaction_date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ ...doc.data(), id: doc.id });
        });

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
  }, [db, selectedCardId, filter, startDate, endDate]); // Añadido startDate y endDate como dependencias

  // Obtener las transacciones de la pagina actual
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Cambiar de pagina
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="text-center">
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
              <option value="pagado">Compras</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Menú de selección de fecha */}
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form.Group controlId="dateRange">
            <Form.Label>Filtrar por fecha</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Fecha de inicio"
                />
              </Col>
              <Col>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Fecha de fin"
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {currentTransactions.length === 0 ? (
        <p>No se encontraron transacciones.</p>
      ) : (
        <>
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
              {currentTransactions.map((transaction) => (
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

          {/* Paginación */}
          <Pagination className="justify-content-center">
            {[...Array(Math.ceil(transactions.length / transactionsPerPage)).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </Container>
  );
};