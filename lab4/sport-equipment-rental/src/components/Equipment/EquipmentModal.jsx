import React from 'react';
import './EquipmentModal.css';

function EquipmentModal({ isOpen, onClose, equipment, onRent }) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <img src={equipment.image} alt={equipment.name} />
        <h2>{equipment.name}</h2>
        <p>{equipment.description}</p>
        <p>Ціна: <span>{equipment.price} грн/день</span></p>
        <p>Доступно: <span>{equipment.quantity} шт.</span></p>
        <button 
          id="rent-button-modal"
          onClick={() => {
            onRent(equipment);
            onClose();
          }}
        >
          Орендувати
        </button>
      </div>
    </div>
  );
}

export default EquipmentModal; 