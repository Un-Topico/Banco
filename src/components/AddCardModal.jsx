import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { CreditCardForm } from './CreditCardForm';

export const AddCardModal = ({ show, onHide }) => {
  const [isCardSaved, setIsCardSaved] = useState(false);

  const handleCardSaved = (saved) => {
    setIsCardSaved(saved);
    if (saved) {
      // Opcional: Puedes cerrar el modal si la tarjeta se guardó exitosamente
      setTimeout(() => {
        setIsCardSaved(false); // Resetear estado para futuras aperturas del modal
      }, 1500);
    }
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
