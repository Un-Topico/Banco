import React from 'react';
import { Modal } from 'react-bootstrap';
import { CreditCardForm } from './CreditCardForm';

export const AddCardModal = ({ show, onHide }) => {

  const handleCardSaved = (saved) => {
   
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Nueva Tarjeta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreditCardForm onCardSaved={handleCardSaved} />
      </Modal.Body>
    </Modal>
  );
};
