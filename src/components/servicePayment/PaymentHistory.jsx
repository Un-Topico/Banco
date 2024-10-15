import React, { useEffect, useState } from "react";
import { Card, ListGroup, Spinner, Container, Form, Row, Col, Pagination } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { getUserCards, getPurchaseHistory } from "../../api/paymentHistoryApi"; // Importar las funciones de la API

// Registrar los componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

export const PaymentHistory = ({ currentUser }) => {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchUserCards = async () => {
      try {
        const userCards = await getUserCards(currentUser.uid);
        setCards(userCards);
      } catch (error) {
        console.error("Error al obtener las tarjetas del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [currentUser]);

  const fetchPurchaseHistoryData = async (cardId) => {
    try {
      setLoading(true);
      const purchaseHistory = await getPurchaseHistory(cardId);
      setTransactions(purchaseHistory);
    } catch (error) {
      console.error("Error al obtener el historial de compras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelection = (e) => {
    const cardId = e.target.value;
    setSelectedCardId(cardId);
    if (cardId) {
      fetchPurchaseHistoryData(cardId);
    } else {
      setTransactions([]);
    }
  };

  // Datos para el gráfico de barras por categoría
  const categoryData = transactions.reduce((acc, transaction) => {
    const { category, amount } = transaction;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Gastos por Categoría',
        data: Object.values(categoryData),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Datos para el gráfico de línea (transacciones a lo largo del tiempo)
  const lineChartData = {
    labels: transactions.map(transaction => new Date(transaction.transaction_date.seconds * 1000).toLocaleDateString()),
    datasets: [
      {
        label: 'Monto de Compras',
        data: transactions.map(transaction => transaction.amount),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  // Datos para el gráfico de barras por tipo de servicio
  const serviceTypeData = transactions.reduce((acc, transaction) => {
    if (transaction.transaction_type === "pagoServicio") {
      const { service_type, amount } = transaction;
      acc[service_type] = (acc[service_type] || 0) + amount;
    }
    return acc;
  }, {});

  const serviceBarChartData = {
    labels: Object.keys(serviceTypeData),
    datasets: [
      {
        label: 'Gastos por Tipo de Servicio',
        data: Object.values(serviceTypeData),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Paginación
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <h2 className="text-center mb-4">Historial de Compras y Pagos de Servicios</h2>

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
                {card.cardNumber} - Saldo: ${card.balance}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      <Row>
        {/* Historial de compras con paginación */}
        <Col md={6}>
          {selectedCardId && currentTransactions.length > 0 && (
            currentTransactions.map((transaction) => (
              <Card key={transaction.transaction_id} className="mb-3 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span>
                    <FaShoppingCart /> {transaction.transaction_type === "compraEnLinea" ? "Compra en Línea" : "Pago de Servicio"}
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
            ))
          )}

          {selectedCardId && currentTransactions.length === 0 && !loading && (
            <p className="text-center">No hay transacciones para esta tarjeta.</p>
          )}

          {/* Paginación */}
          {transactions.length > transactionsPerPage && (
            <Pagination className="justify-content-center mt-3">
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
          )}
        </Col>

        {/* Gráficos */}
        <Col md={6}>
          {selectedCardId && transactions.length > 0 && (
            <>
              <h4>Gastos por Categoría</h4>
              <Bar data={barChartData} className="mb-4" />
              <h4>Gastos a lo Largo del Tiempo</h4>
              <Line data={lineChartData} className="mb-4" />
              <h4>Gastos por Tipo de Servicio</h4>
              <Bar data={serviceBarChartData} />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};
