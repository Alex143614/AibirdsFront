import React, { useState } from 'react';
import './InfoPage.css';

// Укажите порт сами: например "http://localhost:5208/api/birds/info"
const API_URL = "http://localhost:5208/api/birds/info";

interface BirdInfo {
  species: string;
  appearance: string | null;
  habitat: string | null;
  diet: string | null;
}

export default function InfoPage() {
  const [species, setSpecies] = useState('');
  const [result, setResult] = useState<BirdInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();    
    setError('');
    setResult(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token
        },
        body: JSON.stringify({ species: species.trim() })
      });

      if (!response.ok) {
        // C# может вернуть BadRequest("Error with Python Ai")
        const text = await response.text();
        throw new Error(text || 'Помилка від сервера');
      }

      const data: BirdInfo = await response.json();

      // Если C# вернул лимит
      if (data.species === "limit") {
        setError('Ліміт пошуку, купіть підписку');
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="info-page">
      <h1>Информация о птице</h1>

      <form onSubmit={handleSearch} className="info-form">
        <input
          type="text"
          placeholder="Введіть вид птиці"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          required
          className="info-input"
        />
        <button type="submit" disabled={loading} className="info-btn">
          {loading ? 'Шукаємо...' : 'Отримати інформацию'}
        </button>
      </form>

      {error && <p className="info-error">{error}</p>}

      {result && (
        <div className="info-result">
          <h2>{result.species}</h2>

          <div className="info-section">
            <h3>зовнішність</h3>
            <p>{result.appearance || 'Нема данних'}</p>
          </div>

          <div className="info-section">
            <h3>середа проживання</h3>
            <p>{result.habitat || 'Нема данних'}</p>
          </div>

          <div className="info-section">
            <h3>харчування</h3>
            <p>{result.diet || 'Нема данних'}</p>
          </div>
        </div>
      )}
    </div>
  );
}