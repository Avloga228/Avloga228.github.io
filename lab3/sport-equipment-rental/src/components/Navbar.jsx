import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <header>
      <div className="container header-container">
        <div className="logo">SportRent</div>
        <nav>
          <ul>
            <li className="menu-item">
              <NavLink to="/equipment">Обладнання</NavLink>
              <div className="underline"></div>
            </li>
            <li className="menu-item">
              <NavLink to="/rentals">Мої оренди</NavLink>
              <div className="underline"></div>
            </li>
            <li className="menu-item">
              <NavLink to="/payment">Оплата</NavLink>
              <div className="underline"></div>
            </li>
            <li className="menu-item login">
              <NavLink to="/login">Вхід</NavLink>
              <div className="underline"></div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar; 