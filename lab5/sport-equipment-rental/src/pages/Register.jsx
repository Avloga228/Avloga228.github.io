import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Створюємо користувача в Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Додаємо користувача у Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name,
        email,
        age: Number(age)
      });

      navigate("/equipment");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-bg">
      <h1
        style={{
          color: "#222",
          marginBottom: "24px",
          marginTop: "0",
          fontWeight: 700,
          fontSize: "2.2rem",
          textAlign: "center"
        }}
      >
        Реєстрація
      </h1>
      <div className="auth-container">
        <div className="auth-logo">
          <span>🏀</span> SportRent
        </div>
        <div className="auth-desc">
          Створіть акаунт, щоб орендувати спортивне обладнання швидко та зручно!
        </div>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Ім'я"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Вік"
            value={age}
            onChange={e => setAge(e.target.value)}
            min={1}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Зареєструватися</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>
          Вже маєте акаунт? <a href="/login">Увійти</a>
        </p>
        <div className="auth-tip">
          <b>Порада:</b> Використовуйте надійний пароль для захисту свого акаунту!
        </div>
        <div className="auth-benefits" style={{
          marginTop: "22px",
          background: "#eafaf1",
          borderLeft: "4px solid #2ecc71",
          padding: "12px 16px",
          borderRadius: "8px",
          color: "#217a4b",
          fontSize: "0.98rem",
          boxShadow: "0 2px 8px rgba(46,204,113,0.04)",
          width: "100%",
          textAlign: "left"
        }}>
          <b>Переваги реєстрації:</b>
          <ul style={{margin: "8px 0 0 18px", padding: 0}}>
            <li>Доступ до історії ваших оренд</li>
            <li>Можливість швидко оформлювати нові замовлення</li>
            <li>Ексклюзивні пропозиції для зареєстрованих користувачів</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;