import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { apiPath } from '../config';
import './Rentals.css';

function Rentals() {
  const [user, setUser] = useState(undefined);
  const [rentedItems, setRentedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const navigate = useNavigate();

  // Відстеження авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(currentUser !== undefined ? false : true);
    });
    return () => unsubscribe();
  }, []);

  // Отримання оренд з API
  useEffect(() => {
    const fetchUserRentals = async (userId) => {
      try {
        setLoading(true);
        // Створюємо URL з параметрами фільтрації ціни, якщо вони задані
        let path = `rentals?userId=${userId}`;
        
        if (priceFilter.min) {
          path += `&minPrice=${priceFilter.min}`;
        }
        
        if (priceFilter.max) {
          path += `&maxPrice=${priceFilter.max}`;
        }
        
        const requestUrl = apiPath(path);
        console.log("API запит для отримання оренд на URL:", requestUrl);
        
        const response = await fetch(requestUrl, {
          // Додаємо credentials для кук крос-доменно
          credentials: 'include',
          headers: {
            // Додаємо заголовок для відлагодження
            'X-Client-Source': 'vercel-frontend'
          }
        });
        
        console.log("Відповідь від сервера на запит оренд:", response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error('Не вдалося отримати дані про оренди');
        }
        
        const data = await response.json().catch(e => {
          console.error("Помилка розпарсювання JSON:", e);
          return [];
        });
        console.log("Отримані дані оренд:", data);
        
        setRentedItems(data);
      } catch (error) {
        console.error('Помилка при отриманні орендованих товарів:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserRentals(user.uid);
    }
  }, [user, priceFilter]);

  // Обробник зміни фільтрів ціни
  const handlePriceFilterChange = (e) => {
    const { name, value } = e.target;
    setPriceFilter(prev => ({ ...prev, [name]: value }));
  };

  // Застосування фільтрів
  const applyPriceFilter = (e) => {
    e.preventDefault();
    // Фільтри застосовуються через effect при зміні priceFilter
  };

  // Скидання фільтрів
  const resetFilters = () => {
    setPriceFilter({ min: '', max: '' });
  };

  // Видалення оренди
  const handleDelete = async (id) => {
    try {
      const itemToDelete = rentedItems.find(item => item.id === id);
      if (!itemToDelete) return;

      // 1. Видаляємо оренду з Firestore
      await deleteDoc(doc(db, "rentals", id));
      setRentedItems(rentedItems.filter(item => item.id !== id));

      // 2. Повертаємо товар на склад (збільшуємо quantity у inventory)
      if (itemToDelete.equipmentId) {
        const inventoryRef = doc(db, "inventory", String(itemToDelete.equipmentId));
        await updateDoc(inventoryRef, {
          quantity: increment(1)
        });
      }
    } catch (error) {
      console.error("Помилка при видаленні оренди:", error);
    }
  };

  const handlePayment = (id) => {
    navigate('/payment', { state: { payIds: [id] } });
  };

  const handlePayAll = () => {
    const allPendingIds = rentedItems.filter(item => item.status === 'очікує оплати').map(item => item.id);
    navigate('/payment', { state: { payIds: allPendingIds } });
  };

  if (loading) {
    return <div style={{textAlign: "center", marginTop: "40px", color: "#ff782b"}}>Завантаження...</div>;
  }

  if (!user) {
    return (
      <div className="rentals-page">
        <h1>Мої оренди</h1>
        <div className="rentals-content">
          <div className="empty-rentals">
            <div className="empty-rentals-icon">🔒</div>
            <h2>Щоб переглядати свої оренди, увійдіть у акаунт</h2>
            <p>
              <a href="/login" style={{ color: "#ff782b", textDecoration: "underline" }}>Увійти</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Перевіряємо, чи є товари, які очікують оплати
  const hasPendingItems = rentedItems.some(item => item.status === 'очікує оплати');

  return (
    <div className="rentals-page">
      <h1>Мої оренди</h1>
      
      {/* Додаємо фільтр за ціною */}
      <div className="filter-container">
        <form onSubmit={applyPriceFilter} className="price-filter">
          <div className="filter-group">
            <label>Ціна від:</label>
            <input 
              type="number" 
              name="min" 
              value={priceFilter.min} 
              onChange={handlePriceFilterChange} 
              placeholder="Мін. ціна"
            />
          </div>
          <div className="filter-group">
            <label>до:</label>
            <input 
              type="number" 
              name="max" 
              value={priceFilter.max} 
              onChange={handlePriceFilterChange} 
              placeholder="Макс. ціна"
            />
          </div>
          <button type="submit" className="apply-filter">Застосувати</button>
          <button type="button" className="reset-filter" onClick={resetFilters}>Скинути</button>
        </form>
      </div>
      
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
                      <p>Дата оренди: {item.date ? new Date(item.date).toLocaleDateString() : ''}</p>
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