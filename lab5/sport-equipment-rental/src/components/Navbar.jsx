import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from "firebase/firestore";
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(""); // Додаємо стан для імені
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Якщо користувач залогінений — отримуємо ім'я з Firestore
      if (currentUser) {
        try {
          const q = query(collection(db, "users"), where("uid", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setUserName(data.name || "");
          } else {
            setUserName("");
          }
        } catch (e) {
          setUserName("");
        }
      } else {
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

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
            {!user ? (
              <li className="menu-item login">
                <NavLink to="/login">Вхід</NavLink>
                <div className="underline"></div>
              </li>
            ) : (
              <li className="menu-item login" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Аватарка */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#ff782b',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    marginRight: 6,
                    userSelect: 'none'
                  }}
                  title={user.email}
                >
                  {userName
                    ? userName[0].toUpperCase()
                    : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                {/* Вихід як пункт меню */}
                <span
                  className="logout-link"
                  onClick={handleLogout}
                  tabIndex={0}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    font: "inherit",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    textDecoration: "none",
                    outline: "none",
                    boxShadow: "none"
                  }}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") handleLogout(); }}
                >
                  Вихід
                </span>
                <div className="underline"></div>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;