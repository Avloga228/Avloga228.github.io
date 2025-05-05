import React from 'react';
import './EquipmentCard.css';

function EquipmentCard({ item, onRent, onClick }) {
  const handleClick = (e) => {
    // Якщо клікнули по кнопці "Орендувати", не відкриваємо модальне вікно
    if (e.target.classList.contains('rent-button')) {
      return;
    }
    onClick();
  };

  return (
    <div className="equipment-card" onClick={handleClick}>
      <img src={item.image} alt={item.name} />
      <div className="info">
        <h3>{item.name}</h3>
        <p>Ціна: <span className="price">{item.price} грн/день</span></p>
        <p className="quantity">Доступно: {item.quantity || 0}</p>
        <button 
          className="rent-button"
          onClick={(e) => {
            e.stopPropagation();
            onRent();
          }}
          disabled={!item.quantity || item.quantity <= 0}
        >
          Орендувати
        </button>
      </div>
    </div>
  );
}

export default EquipmentCard; 