import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Equipment from './pages/Equipment';
import Rentals from './pages/Rentals';
import Payment from './pages/Payment';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/equipment" />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
