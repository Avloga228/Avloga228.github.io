import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import './Payment.css';

function Payment() {
  const [user, setUser] = useState(undefined);
  const [rentedItems, setRentedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [rentalDays, setRentalDays] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const payIds = location.state?.payIds || [];
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setIsInitialized(false);
  }, [user]);

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
      setLoading(true);
      const q = query(
        collection(db, "rentals"),
        where("userId", "==", userId),
        where("status", "==", "очікує оплати")
      );
      const querySnapshot = await getDocs(q);
      const rentals = [];
      querySnapshot.forEach((docSnap) => {
        rentals.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRentedItems(rentals);
  
      // Ініціалізуємо selectedItems/rentalDays лише один раз!
      if (!isInitialized) {
        const initialSelectedItems = {};
        const initialRentalDays = {};
        rentals.forEach(item => {
          initialSelectedItems[item.id] = payIds.length > 0 ? payIds.includes(item.id) : false;
          initialRentalDays[item.id] = 1;
        });
        setSelectedItems(initialSelectedItems);
        setRentalDays(initialRentalDays);
        setIsInitialized(true);
        calculateTotal(initialSelectedItems, initialRentalDays, rentals);
      }
      setLoading(false);
    };
  
    if (user && !isInitialized) {
      fetchUserRentals(user.uid);
    }
  }, [user, payIds, isInitialized]);

  const calculateTotal = (selected, days, items = rentedItems) => {
    const total = items.reduce((sum, item) => {
      if (selected[item.id]) {
        return sum + (item.price * (days[item.id] || 1));
      }
      return sum;
    }, 0);
    setTotalAmount(total);
  };

  // Форматування номера картки (додавання пробілів після кожних 4 цифр)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Форматування терміну дії (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 3) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    } else if (v.length === 2) {
      return v + '/';
    }
    return v;
  };

  // Форматування CVV (3-4 цифри)
  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = formatCVV(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleItemSelection = (id) => {
    const newSelectedItems = {
      ...selectedItems,
      [id]: !selectedItems[id]
    };
    setSelectedItems(newSelectedItems);
    calculateTotal(newSelectedItems, rentalDays);
  };

  const handleDaysChange = (id, value) => {
    if (value < 1) value = 1;
    if (value > 30) value = 30;

    const newRentalDays = {
      ...rentalDays,
      [id]: value
    };
    setRentalDays(newRentalDays);
    calculateTotal(selectedItems, newRentalDays);
  };

  // Оновлення статусу оренди у Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedItemIds = Object.keys(selectedItems).filter(id => selectedItems[id]);
    for (const id of selectedItemIds) {
      const item = rentedItems.find(item => item.id === id);
      if (!item) continue;
      await updateDoc(doc(db, "rentals", id), {
        status: "оплачено",
        days: rentalDays[id] || 1,
        totalPrice: item.price * (rentalDays[id] || 1)
      });
    }

    // Оновлюємо список оренд після оплати
    if (user) {
      const q = query(
        collection(db, "rentals"),
        where("userId", "==", user.uid),
        where("status", "==", "очікує оплати")
      );
      const querySnapshot = await getDocs(q);
      const rentals = [];
      querySnapshot.forEach((docSnap) => {
        rentals.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRentedItems(rentals);

      // Скидаємо вибір
      const remainingSelectedItems = {};
      const remainingRentalDays = {};
      rentals.forEach(item => {
        remainingSelectedItems[item.id] = false;
        remainingRentalDays[item.id] = rentalDays[item.id] || 1;
      });
      setSelectedItems(remainingSelectedItems);
      setRentalDays(remainingRentalDays);
      calculateTotal(remainingSelectedItems, remainingRentalDays, rentals);
    }

    alert('Оплата успішно проведена!');
    // Якщо всі оплачені — повертаємо на сторінку оренд
    if (rentedItems.length === selectedItemIds.length) {
      navigate('/rentals');
    }
  };

  const handleCancel = () => {
    navigate('/equipment');
  };

  // Валідація форми перед відправкою
  const isFormValid = () => {
    const { name, cardNumber, expiryDate, cvv } = formData;
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const cleanExpiryDate = expiryDate.replace(/\//g, '');

    return (
      name.trim() !== '' &&
      cleanCardNumber.length === 16 &&
      cleanExpiryDate.length === 4 &&
      cvv.length >= 3 &&
      cvv.length <= 4
    );
  };

  
  if (!user) {
    return (
      <div className="payment-page">
        <h1>Оплата оренди</h1>
        <div className="payment-content">
          <div className="empty-payment">
            <p>Щоб переглядати оплату, увійдіть у акаунт</p>
            <button className="back-button" onClick={handleCancel}>
              На головну
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Оплата оренди</h1>
      <div className="payment-content">
        {rentedItems.length === 0 ? (
          <div className="empty-payment">
            <p>Наразі у вас немає активних оренд для оплати.</p>
            <button className="back-button" onClick={handleCancel}>
              Повернутися на головну
            </button>
          </div>
        ) : (
          <div className="payment-form">
            <h2>Деталі оплати</h2>
            <div className="order-summary">
              <h3>Ваше замовлення:</h3>
              {rentedItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-checkbox">
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedItems[item.id] || false}
                      onChange={() => handleItemSelection(item.id)}
                    />
                  </div>
                  <div className="order-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p className="item-price">{item.price} грн/день</p>
                    <div className="rental-days">
                      <label htmlFor={`days-${item.id}`}>Кількість днів:</label>
                      <div className="days-input-group">
                        <button
                          type="button"
                          onClick={() => handleDaysChange(item.id, (rentalDays[item.id] || 1) - 1)}
                          disabled={!selectedItems[item.id] || (rentalDays[item.id] || 1) <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id={`days-${item.id}`}
                          min="1"
                          max="30"
                          value={rentalDays[item.id] || 1}
                          onChange={(e) => handleDaysChange(item.id, parseInt(e.target.value) || 1)}
                          disabled={!selectedItems[item.id]}
                        />
                        <button
                          type="button"
                          onClick={() => handleDaysChange(item.id, (rentalDays[item.id] || 1) + 1)}
                          disabled={!selectedItems[item.id] || (rentalDays[item.id] || 1) >= 30}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="item-total">
                      Загалом: {item.price * (rentalDays[item.id] || 1)} грн
                    </p>
                  </div>
                </div>
              ))}
              <div className="total">
                <p>Загальна сума:</p>
                <p>{totalAmount} грн</p>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Ім'я на картці</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Номер картки</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxLength={19}
                  required
                />
                <small className="form-hint">16 цифр, автоматичне форматування</small>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Термін дії</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  <small className="form-hint">Формат: MM/YY</small>
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="XXX"
                    maxLength={4}
                    required
                  />
                  <small className="form-hint">3-4 цифри</small>
                </div>
              </div>
              <div className="payment-actions">
                <button type="button" className="cancel-button" onClick={handleCancel}>
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="payment-button"
                  disabled={!isFormValid() || rentedItems.filter(item => selectedItems[item.id]).length === 0}
                >
                  Сплатити {totalAmount} грн
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;