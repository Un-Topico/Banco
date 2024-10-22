import React, { useEffect, useState } from "react";
import { Table, Container, Row, Col, Form, Alert, Pagination } from "react-bootstrap";
import { listenToTransactions } from "../../api/transactionHistoryApi"; // Importar la API

export const TransactionHistory = ({ selectedCardId }) => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all"); // Estado para el filtro de tipo
  const [startDate, setStartDate] = useState(""); // Estado para la fecha de inicio
  const [endDate, setEndDate] = useState(""); // Estado para la fecha de fin
  const [error, setError] = useState(null); // Estado para mostrar errores
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const transactionsPerPage = 5; // Definir el número de transacciones por página

  useEffect(() => {
    // No hacer nada si no hay una tarjeta seleccionada
    if (!selectedCardId) {
      setTransactions([]);
      return;
    }

    // Llamar a la API para obtener las transacciones
    const unsubscribe = listenToTransactions(
      selectedCardId,
      filter,
      startDate,
      endDate,
      (transactionsData) => {
        setTransactions(transactionsData);
        setError(null);
      },
      (error) => {
        console.error("Error al obtener transacciones:", error);
        setError("Hubo un error al obtener las transacciones.");
      }
    );

    // Limpiar el listener al desmontar el componente
    return () => unsubscribe();
  }, [selectedCardId, filter, startDate, endDate]);

  // Obtener las transacciones de la página actual
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Cambiar de página
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
