import React, { useState } from 'react';
import TopLine from './components/TopLine';
import ImagePage from './pages/ImagePage';
import SoundPage from './pages/SoundPage';
import InfoPage from './pages/InfoPage';
import StatisticsPage from './pages/StatisticsPage';
import Burger from './components/Burger';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Стейт для хранения текущей страницы. 
  // 'main' - главная, 'another' - другая
  const [currentPage, setCurrentPage] = useState('main');

  // ТУТ МЫ ЗАДАЕМ КООРДИНАТЫ БУРГЕРА
  const burgerTop = '20px'; 
  const burgerLeft = '0px';

  // Функция для переключения страниц
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false); // Закрываем меню после выбора
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', position: 'relative' }}>
      
    
      <div className="burger-wrapper" style={{ top: burgerTop, left: burgerLeft }}>
        <Burger onClick={() => setIsMenuOpen(!isMenuOpen)} />
      </div>

      <TopLine />
      {isMenuOpen && (
        <div className="dropdown-menu" style={{ left: burgerLeft }}>
          <div className="dropdown-item" onClick={() => handleNavigate('image')}>
            пошук по зображеню
          </div>
          <div className="dropdown-item" onClick={() => handleNavigate('sound')}>
            пошук по співу
          </div>
          <div className="dropdown-item" onClick={() => handleNavigate('info')}>
            інформация виду
          </div>
           <div className="dropdown-item" onClick={() => handleNavigate('statis')}>
            статистика
          </div>
        </div>
      )}

     
      <div className="page-container">
        {currentPage === 'image' && <ImagePage />}
        {currentPage === 'sound' && <SoundPage />}
        {currentPage === 'info'  && <InfoPage />}
        {currentPage === 'statis'&& <StatisticsPage />}
      </div>

    </div>
  );
}

export default App;