import React from 'react';
import { Card, Col } from 'react-bootstrap';
const CardComponent = ({ card, onClick, isActive }) => {
  const getCardImage = (cardType) => {
    switch (cardType) {
      case 'Visa':
        return "https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/cardsimg%2Fvisa.webp?alt=media&token=6d921385-f843-414d-a484-a7129cd05ca6";
      case 'MasterCard':
        return "https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/cardsimg%2Ftarjeta.png?alt=media&token=aee02437-55d7-423e-80d6-45ec18708aa0";
      case 'American Express':
        return "https://firebasestorage.googleapis.com/v0/b/untopico-b888c.appspot.com/o/cardsimg%2Famerican.webp?alt=media&token=3bfea50d-64f0-4dcd-9b44-5cd5b1a2bf9e";
      default:
        return null;
    }
  };

  return (
    <Col md={4} className="mb-4">
      <Card
        onClick={() => onClick(card)}
        style={{ cursor: 'pointer' }}
        className={isActive ? 'bg-primary text-white' : ''}
      >
        {/* Muestra la imagen solo si existe */}
        {getCardImage(card.cardType) && (
          <Card.Img width={100} src={getCardImage(card.cardType)} />
        )}

        <Card.ImgOverlay className="d-flex flex-column justify-content-end align-items-start" style={{ paddingLeft: 40 }}>
          <Card.Title className="text-white">{card.cardNumber}</Card.Title>
          <Card.Text className="text-center w-100 text-white">
            <strong>{card.expiryDate}</strong>
          </Card.Text>
          <Card.Text className="text-white">
            <strong>{card.cardHolderName}</strong>
          </Card.Text>
        </Card.ImgOverlay>
      </Card>
    </Col>
  );
};

export default CardComponent;
