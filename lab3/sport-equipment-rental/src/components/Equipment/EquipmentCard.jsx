import React from 'react';
import './EquipmentCard.css';

function EquipmentCard({ id, name, price, image, onRent }) {
  return (
    <div className="equipment-card">
      <img src={image} alt={name} />
      <div className="info">
        <h3>{name}</h3>
        <p>Ціна: <span className="price">{price} грн/день</span></p>
        <button 
          className="rent-button"
          onClick={() => onRent({ id, name, price, image })}
        >
          Орендувати
        </button>
      </div>
    </div>
  );
}

export default EquipmentCard; 