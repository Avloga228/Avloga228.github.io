import React, { useEffect } from 'react';
import './EquipmentModal.css';

function EquipmentModal({ equipment, onClose, onRent }) {
  // Закриття модального вікна при натисканні Escape
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    // Забороняємо прокрутку на фоні
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Закриття модального вікна при натисканні на фон
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <img src={equipment.image} alt={equipment.name} />
        <h2>{equipment.name}</h2>
        <p>{equipment.description}</p>
        <p>Ціна: <span>{equipment.price} грн/день</span></p>
        <p>Доступно: <span>{equipment.quantity} шт.</span></p>
        <button 
          id="rent-button-modal" 
          onClick={onRent}
          disabled={!equipment.quantity || equipment.quantity <= 0}
        >
          Орендувати
        </button>
      </div>
    </div>
  );
}

export default EquipmentModal; 