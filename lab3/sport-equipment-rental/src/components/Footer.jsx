import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-section">
          <h3>Про нас</h3>
          <p>SportRent - оренда спортивного обладнання швидко та зручно!</p>
          <p>Адреса: вул. Спортивна, 12, Київ, Україна</p>
        </div>
        <div className="footer-section">
          <h3>Контакти</h3>
          <p>Телефон: <a href="tel:+380991234567">+380 99 123 45 67</a></p>
          <p>Email: <a href="mailto:support@sportrent.com">support@sportRent.com</a></p>
        </div>
        <div className="footer-section">
          <h3>Соціальні мережі</h3>
          <a href="#">Facebook</a> | 
          <a href="#">Instagram</a> | 
          <a href="#">Telegram</a>
        </div>
      </div>
      <p className="footer-bottom">© 2025 SportRent</p>
    </footer>
  );
}

export default Footer; 