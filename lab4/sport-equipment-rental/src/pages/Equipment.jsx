import React, { useState, useEffect } from 'react';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentModal from '../components/EquipmentModal';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc, increment, addDoc } from "firebase/firestore";
import './Equipment.css';

import { setDoc } from "firebase/firestore";

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState('Всі');
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Відстеження авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Отримати обладнання з Firestore
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const items = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setEquipment(items);
      setFilteredEquipment(items);
      setLoading(false);
    };
    fetchInventory();
  }, []);

  // Унікальні типи спорту для фільтрації
  const sportTypes = ['Всі', ...Array.from(new Set(equipment.map(item => item.sportType)))];

  // Фільтрація обладнання за типом спорту
  useEffect(() => {
    if (selectedSportType === 'Всі') {
      setFilteredEquipment(equipment);
    } else {
      const filtered = equipment.filter(item => item.sportType === selectedSportType);
      setFilteredEquipment(filtered);
    }
  }, [selectedSportType, equipment]);

  const handleCardClick = (item) => {
    setSelectedEquipment(item);
    setShowModal(true);
  };

  // Оренда обладнання: додає оренду в rentals і зменшує кількість у inventory
  const handleRent = async (item) => {
    if (!user) {
      alert("Щоб орендувати обладнання, потрібно увійти в акаунт!");
      return;
    }
    if (!item.quantity || item.quantity <= 0) {
      alert("Цього обладнання вже немає в наявності.");
      return;
    }
    try {
      // Додаємо оренду в rentals
      await addDoc(collection(db, "rentals"), {
        userId: user.uid,
        equipmentId: item.id,
        name: item.name,
        date: new Date().toISOString(),
        price: item.price,
        status: "очікує оплати",
        image: item.image,
        sportType: item.sportType
      });
      // Зменшуємо кількість у inventory
      const inventoryRef = doc(db, "inventory", String(item.id));
      await updateDoc(inventoryRef, {
        quantity: increment(-1)
      });
      // Оновлюємо локальний стан (щоб не чекати повторного fetch)
      setEquipment(prev =>
        prev.map(eq => eq.id === item.id
          ? { ...eq, quantity: eq.quantity - 1 }
          : eq
        )
      );
      setFilteredEquipment(prev =>
        prev.map(eq => eq.id === item.id
          ? { ...eq, quantity: eq.quantity - 1 }
          : eq
        )
      );
      if (showModal) setShowModal(false);
    } catch (e) {
      alert("Помилка при збереженні оренди: " + e.message);
    }
  };

  const handleSportTypeChange = (sportType) => {
    setSelectedSportType(sportType);
  };

  const getGridClass = () => {
    return filteredEquipment.length === 1 ? 'equipment-grid single-item' : 'equipment-grid';
  };

  return (
    <div className="equipment-page">
      <div className="hero">
        <div className="container">
          <h1>Вітаємо в SportRent!</h1>
          <p>Прокачай свої можливості – орендуй спортивне обладнання та насолоджуйся активним способом життя! 
          Велосипеди, каяки, ролики, м'ячі та ще багато іншого – усе це доступне для оренди вже зараз!</p>
          <button 
            id="toggle-btn" 
            className="hero-btn"
            onClick={() => setShowHiddenSection(!showHiddenSection)}
          >
            {showHiddenSection ? 'Приховати акції' : 'Дізнатися про акції'}
          </button>
          
          {showHiddenSection && (
            <div className="hidden-content">
              <h2>Спеціальні пропозиції</h2>
              <div className="promo-grid">
                <div className="promo-card">
                  <h3>🎯 Вигідна пакетна оренда</h3>
                  <p>Орендуйте 3 будь-які товари та отримайте знижку 20% на весь замовлення!</p>
                </div>
                <div className="promo-card">
                  <h3>⏳ Довгострокова оренда</h3>
                  <p>При оренді від 7 днів - знижка 15% на весь період!</p>
                </div>
                <div className="promo-card">
                  <h3>👥 Дружня пропозиція</h3>
                  <p>Приведіть друга і отримайте 10% знижку на наступне замовлення для обох!</p>
                </div>
              </div>
              <div className="newsletter">
                <h3>Підпишіться на наші новини</h3>
                <form onSubmit={(e) => { e.preventDefault(); alert('Ви успішно підписалися на розсилку!'); }}>
                  <input type="email" placeholder="Ваш email" required />
                  <button type="submit">Підписатися</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="container">
        <h1>Обладнання для оренди</h1>
        
        <div className="filter-container">
          <h3>Фільтрувати за видом спорту:</h3>
          <div className="sport-type-filter">
            {sportTypes.map(sportType => (
              <button 
                key={sportType} 
                className={`filter-btn ${selectedSportType === sportType ? 'active' : ''}`}
                onClick={() => handleSportTypeChange(sportType)}
              >
                {sportType}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div style={{textAlign: "center", margin: "40px 0", color: "#ff782b"}}>Завантаження...</div>
        ) : (
          <section className={getGridClass()}>
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map(item => (
                <EquipmentCard 
                  key={item.id} 
                  item={item} 
                  onRent={() => handleRent(item)}
                  onClick={() => handleCardClick(item)}
                />
              ))
            ) : (
              <div className="no-equipment">
                <p>На жаль, наразі немає доступного обладнання для цього виду спорту.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {showModal && selectedEquipment && (
        <EquipmentModal 
          equipment={selectedEquipment} 
          onClose={() => setShowModal(false)}
          onRent={() => handleRent(selectedEquipment)}
        />
      )}
    </div>
  );
}

export default Equipment;