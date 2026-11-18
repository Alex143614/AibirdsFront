import React, { useState, useEffect } from 'react';
import './TopLine.css';
import AuthPanel from './AuthPanel';
import WalletPanel from './WalletPanel';
import avatarImage from '../images/avatar.png';
import walletImage from '../images/wallet.png';

interface UserProfile {
  id: number;
  username: string;
  createdAt: string;
}

export default function TopLine() {
  const [user, setUser] = useState<UserProfile | null>(null);//--хранит имя пользователя
  const [token, setToken] = useState<string | null>(null);//-----токен пользователя
  const [IsAuth, setIsAuth] = useState(false);//-------------

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5208/api/auth/me", {
        headers: { 'Authorization': "Bearer " + token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Помилка аккаунта", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuth(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-logo">AiBirds</div>
        </div>
        
        <div className="navbar-user-section">
          {user && (
            <>
              <button onClick={handleLogout} className="btn-logout-nav">
                Вийти
              </button>
              <button onClick={() => setIsAuth(!IsAuth)} className="btn-wallet">
                <img src={walletImage} alt="Wallet" style={{ width: '30px', height: '30px' }} />
              </button>
            </>
          )}
          
          {!user && (
            <button onClick={() => setIsAuth(!IsAuth)} className="btn-login-nav">
              Увійти
            </button>
          )}
          
          <div className="user-details">
            <span className="user-name">{user ? user.username : ""}</span>
            <span className="user-date">
              {user ? "ви з нами с " + formatDate(user.createdAt) : ""}
            </span>
          </div>
          
          <img src={avatarImage} alt="Avatar" className="user-avatar" />
        </div>
      </nav>

      <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {IsAuth && !user && <AuthPanel />}
        {IsAuth && user && <WalletPanel token={token} />}
      </div>
    </>
  );
}