import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rentals.css';

function Rentals() {
  const [rentedItems, setRentedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('rentedItems') || '[]');
    setRentedItems(items);
  }, []);

  const handleDelete = (id) => {
    // Отримуємо дані про орендований товар
    const itemToDelete = rentedItems.find(item => item.id === id);
    
    // Повертаємо товар в інвентар
    const inventory = JSON.parse(localStorage.getItem('inventory') || '{}');
    inventory[itemToDelete.image] = (inventory[itemToDelete.image] || 0) + 1;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Видаляємо з орендованих
    const updatedItems = rentedItems.filter(item => item.id !== id);
    setRentedItems(updatedItems);
    localStorage.setItem('rentedItems', JSON.stringify(updatedItems));
  };

  const handlePayment = (id) => {
    navigate('/payment');
  };

  const handlePayAll = () => {
    navigate('/payment');
  };

  // Перевіряємо, чи є товари, які очікують оплати
  const hasPendingItems = rentedItems.some(item => item.status === 'очікує оплати');

  return (
    <div className="rentals-page">
      <h1>Мої оренди</h1>
      <div className="rentals-content">
        {rentedItems.length === 0 ? (
          <div className="empty-rentals">
            <div className="empty-rentals-icon">📦</div>
            <h2>У вас ще немає орендованих товарів</h2>
            <p>Перейдіть на сторінку <a href="/equipment">Обладнання</a>, щоб орендувати спортивне обладнання</p>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {rentedItems.map((item) => (
                <div key={item.id} className="order">
                  <img src={item.image} alt={item.name} />
                  <div className="order-info">
                    <div className="order-details">
                      <div className="order-header">
                        <h3>{item.name}</h3>
                        <span className={`status-badge ${item.status.replace(' ', '-')}`}>
                          {item.status}
                        </span>
                      </div>
                      <p>Дата оренди: {item.date}</p>
                      <p>Ціна: {item.price} грн/день</p>
                    </div>
                    <div className="order-actions">
                      {item.status === 'очікує оплати' && (
                        <button onClick={() => handlePayment(item.id)}>
                          Оплатити
                        </button>
                      )}
                      <button className="delete-order" onClick={() => handleDelete(item.id)}>
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasPendingItems && (
              <div className="pay-all-container">
                <button id="pay-all-btn" onClick={handlePayAll}>
                  Оплатити все
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Rentals; 