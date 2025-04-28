import React from 'react';
import './EquipmentFilter.css';

function EquipmentFilter({ onFilterChange }) {
  const sportTypes = [
    'Всі',
    'Футбол',
    'Баскетбол',
    'Теніс',
    'Лижі',
    'Сноуборд',
    'Велоспорт'
  ];

  return (
    <div className="filter-container">
      <h3>Фільтр за видом спорту</h3>
      <div className="filter-buttons">
        {sportTypes.map(type => (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            className="filter-button"
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EquipmentFilter; 