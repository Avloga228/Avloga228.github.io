import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import GoogleLogo from '../assets/google.png'; // Звичайний імпорт PNG

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/equipment");
        } catch (err) {
            setError("Невірний email або пароль");
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate("/equipment");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-bg">
            <h1 style={{ color: "#222", marginBottom: "24px", marginTop: "0", fontWeight: 700, fontSize: "2.2rem", textAlign: "center" }}>
                Вхід
            </h1>
            <div className="auth-container">
                <div className="auth-logo">
                    <span>🏀</span> SportRent
                </div>
                <div className="auth-desc">
                    Вітаємо на платформі оренди спортивного обладнання!<br />
                    Увійдіть, щоб оформити замовлення та переглядати свої оренди.
                </div>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit">Увійти</button>
                    {error && <p className="error">{error}</p>}
                </form>

                <div className="auth-alternative">
                    <div className="auth-alternative-line"></div>
                    <span>Або</span>
                    <div className="auth-alternative-line"></div>
                </div>

                <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn}>
                    <img src={GoogleLogo} alt="Google Logo" className="auth-google-icon" />
                    Увійти з Google
                </button>

                <p>
                    Не маєте акаунту? <a href="/register">Зареєструватися</a>
                </p>
                <div className="auth-tip">
                    <b>Порада:</b> Якщо ви новий користувач, спочатку зареєструйтеся!
                </div>
            </div>
        </div>
    );
}

export default Login;