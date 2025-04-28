import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import './Rentals.css';

function Rentals() {
  const [user, setUser] = useState(undefined);
  const [rentedItems, setRentedItems] = useState([]);
  const navigate = useNavigate();

  // Відстеження авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Отримання оренд з Firestore
  useEffect(() => {
    const fetchUserRentals = async (userId) => {
      const q = query(collection(db, "rentals"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const rentals = [];
      querySnapshot.forEach((docSnap) => {
        rentals.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRentedItems(rentals);
    };

    if (user) {
      fetchUserRentals(user.uid);
    }
  }, [user]);

  if (user === undefined) {
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

  // Видалення оренди з Firestore і повернення обладнання на склад
  const handleDelete = async (id) => {
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
  };

  const handlePayment = (id) => {
    navigate('/payment', { state: { payIds: [id] } });
  };

  const handlePayAll = () => {
    const allPendingIds = rentedItems.filter(item => item.status === 'очікує оплати').map(item => item.id);
    navigate('/payment', { state: { payIds: allPendingIds } });
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