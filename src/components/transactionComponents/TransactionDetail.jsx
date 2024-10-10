import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FaMoneyCheckAlt, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { getTransferById, getCardById } from "../../services/transactionService"; // Asegúrate de crear la función getCardById

export const TransactionDetail = () => {
  const { id } = useParams();
  const [transfer, setTransfer] = useState(null);
  const [fromCardNumber, setFromCardNumber] = useState("");
  const [toCardNumber, setToCardNumber] = useState("");

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const transferData = await getTransferById(id);
        setTransfer(transferData);

        // Buscar el número de tarjeta para 'from_card_id'
        const fromCardData = await getCardById(transferData.from_card_id);
        setFromCardNumber(fromCardData.cardNumber);

        // Buscar el número de tarjeta para 'to_card_id'
        const toCardData = await getCardById(transferData.to_card_id);
        setToCardNumber(toCardData.cardNumber);
      } catch (error) {
        console.error("Error al obtener la transferencia:", error);
      }
    };

    if (id) {
      fetchTransfer();
    }
  }, [id]);

  if (!transfer) {
    return <div>Cargando detalles de la transferencia...</div>;
  }

  return (
    <Card className="m-4">
      <Card.Header className="text-center">
        <h4>Detalles de la Transferencia <FaMoneyCheckAlt /></h4>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={6}>
            <h5><FaInfoCircle /> ID de la Transferencia</h5>
            <p>{transfer.transfer_id}</p>
          </Col>
          <Col md={6}>
            <h5><FaCalendarAlt /> Fecha de la Transferencia</h5>
            <p>{new Date(transfer.transfer_date.seconds * 1000).toLocaleDateString()}</p>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <h5><FaMoneyCheckAlt /> Monto</h5>
            <p>${transfer.amount} MXN</p>
          </Col>
          <Col md={6}>
            <h5><FaInfoCircle /> Descripción</h5>
            <p>{transfer.description || "Sin descripción"}</p>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <h5><FaInfoCircle /> Tarjeta de Origen</h5>
            <Badge bg="info">{fromCardNumber}</Badge>
          </Col>
          <Col md={6}>
            <h5><FaInfoCircle /> Tarjeta de Destino</h5>
            <Badge bg="success">{toCardNumber}</Badge>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
