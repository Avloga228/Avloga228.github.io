import React, { useState, useEffect } from 'react';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentModal from '../components/EquipmentModal';
import './Equipment.css';

const initialEquipment = [
  { id: 1, name: 'Велосипед', price: 200, image: '/images/bike.jpg', description: 'Зручний міський велосипед з міцною рамою і амортизацією, ідеально підходить для поїздок по місту або лісових стежках.', sportType: 'Велоспорт' },
  { id: 2, name: 'Лижі', price: 300, image: '/images/ski.jpg', description: 'Професійні лижі для катання на схилах з високоякісним кріпленням.', sportType: 'Зимові види спорту' },
  { id: 3, name: 'Каяк', price: 500, image: '/images/kayak.jpg', description: 'Легкий та стійкий двомісний каяк для сплавів річками та озерами.', sportType: 'Водні види спорту' },
  { id: 4, name: 'Самокат', price: 100, image: '/images/samokat.jpg', description: 'Маневрений самокат із міцними колесами, ідеальний для прогулянок містом.', sportType: 'Активний відпочинок' },
  { id: 5, name: 'Ролики', price: 130, image: '/images/roliki.jpg', description: 'Зручні та безпечні ролики для катання по рівних дорогах та скейтпарках.', sportType: 'Активний відпочинок' },
  { id: 6, name: 'Футбольний м\'яч', price: 50, image: '/images/football_myatch.jpg', description: 'Офіційний футбольний м\'яч з високоякісного матеріалу, стійкий до зносу.', sportType: 'Футбол' },
  { id: 7, name: 'Баскетбольний м\'яч', price: 50, image: '/images/basketball_myatch.jpg', description: 'Професійний баскетбольний м\'яч з чудовим зчепленням для гри як на відкритих майданчиках, так і в залах.', sportType: 'Баскетбол' },
  { id: 8, name: 'Волейбольний м\'яч', price: 50, image: '/images/volleyball_myatch.jpg', description: 'Легкий та міцний волейбольний м\'яч для ігор на пляжі чи у спортзалі.', sportType: 'Волейбол' },
  { id: 9, name: 'Ракетки та м\'яч для пінгпонгу', price: 120, image: '/images/pingpong.jpg', description: 'Набір якісних ракеток та м\'ячів для настільного тенісу.', sportType: 'Теніс' },
  { id: 10, name: 'Гантелі', price: 100, image: '/images/ganteli.jpg', description: 'Компактні гантелі для домашніх тренувань різної ваги.', sportType: 'Фітнес' },
  { id: 11, name: 'Фітнес-килимок', price: 50, image: '/images/kilim.jpg', description: 'Зручний і м\'який килимок для йоги та фітнесу.', sportType: 'Фітнес' }
];

function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState('Всі');
  const [filteredEquipment, setFilteredEquipment] = useState([]);

  // Отримуємо унікальні типи спорту для фільтрації
  const sportTypes = ['Всі', ...new Set(initialEquipment.map(item => item.sportType))];

  useEffect(() => {
    // Перевіряємо, чи є вже в localStorage інвентар
    const inventory = JSON.parse(localStorage.getItem('inventory')) || {};
    
    // Якщо інвентарю немає або він порожній, ініціалізуємо його
    if (Object.keys(inventory).length === 0) {
      const initialInventory = initialEquipment.reduce((acc, item) => {
        acc[item.image] = 5; // За замовчуванням 5 одиниць кожного товару
        return acc;
      }, {});
      localStorage.setItem('inventory', JSON.stringify(initialInventory));
    }

    // Завантажуємо обладнання з кількістю з інвентаря
    const inventoryData = JSON.parse(localStorage.getItem('inventory'));
    const updatedEquipment = initialEquipment.map(item => ({
      ...item,
      quantity: inventoryData[item.image] || 0
    }));
    
    setEquipment(updatedEquipment);
    setFilteredEquipment(updatedEquipment);
  }, []);

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

  const handleRent = (item) => {
    // Отримуємо інвентар
    const inventory = JSON.parse(localStorage.getItem('inventory')) || {};
    
    // Перевіряємо наявність
    if (!inventory[item.image] || inventory[item.image] <= 0) {
      return;
    }
    
    // Зменшуємо кількість
    inventory[item.image]--;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    // Додаємо до орендованих товарів
    const newOrder = {
      id: Date.now(), // Унікальний ID на основі часу
      name: item.name,
      date: new Date().toLocaleDateString(),
      price: item.price,
      status: 'очікує оплати',
      image: item.image,
      sportType: item.sportType
    };
    
    let rentedItems = JSON.parse(localStorage.getItem('rentedItems')) || [];
    rentedItems.push(newOrder);
    localStorage.setItem('rentedItems', JSON.stringify(rentedItems));
    
    // Оновлюємо стан
    setEquipment(prev => 
      prev.map(eq => eq.id === item.id 
        ? { ...eq, quantity: eq.quantity - 1 } 
        : eq
      )
    );
    
    if (showModal) {
      setShowModal(false);
    }
  };

  const handleSportTypeChange = (sportType) => {
    setSelectedSportType(sportType);
  };

  // Визначаємо клас для сітки обладнання на основі кількості елементів
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