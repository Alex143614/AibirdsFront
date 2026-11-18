import React from 'react';
import './Burger.css';

interface BurgerProps {
  onClick: () => void;
}

export default function Burger({ onClick }: BurgerProps) {
  return (
    <div className="burger-container" onClick={onClick}>
      <div className="burger-line"></div>
      <div className="burger-line"></div>
      <div className="burger-line"></div>
    </div>
  );
}