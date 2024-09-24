import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FaMoneyCheckAlt, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { getTransferById } from "../services/transactionService"; // Asegúrate de tener esta función en tu servicio Firestore

export const TransactionDetail = () => {
  const { id } = useParams(); // Obtén el transfer_id de la ruta
  const [transfer, setTransfer] = useState(null);

  useEffect(() => {
    const fetchTransfer = async () => {
      try {
        const transferData = await getTransferById(id); // Función que busca la transferencia en Firestore
        setTransfer(transferData);
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
            <Badge bg="info">{transfer.from_card_id}</Badge>
          </Col>
          <Col md={6}>
            <h5><FaInfoCircle /> Tarjeta de Destino</h5>
            <Badge bg="success">{transfer.to_card_id}</Badge>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};