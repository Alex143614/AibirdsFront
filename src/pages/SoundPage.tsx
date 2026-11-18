import React, { useState } from 'react';
import './SoundPage.css';

const API_URL = "http://localhost:5208/api/birds/audio";

export default function SoundPage() {
  const [soundUrl, setSoundUrl] = useState('');
  const [result, setResult] = useState<{ species: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Ви не зареєстровані');
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
        body: JSON.stringify({ url: soundUrl })
      });

      if (!response.ok) {
        throw new Error('Помилка при аналізі');
      }

      const data = await response.json();

      // Если C# вернул лимит
      if (data.species === "limit") {
        setError('Ви достигнули ліміту на день');
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
    <div className="sound-page">
      <h1>Анализ звука</h1>

      <form onSubmit={handleAnalyze} className="sound-form">
        <input
          type="url"
          placeholder="Введіть ссилку на завантаженя співа птиці"
          value={soundUrl}
          onChange={(e) => setSoundUrl(e.target.value)}
          required
          className="sound-input"
        />
        <button type="submit" disabled={loading} className="sound-btn">
          {loading ? 'Аналізуємо...' : 'Дізнатися вид птиці'}
        </button>
      </form>

      {error && <p className="sound-error">{error}</p>}

      {/* Блок плеера и результата */}
      {soundUrl && (
        <div className="sound-result-container">
          <div className="sound-preview">
            <audio controls src={soundUrl}>
              Ваш браузер не підтримує аудио
            </audio>
          </div>

          {result && (
            <div className="result-info">
              <p><strong>Вид птиці:</strong> {result.species}</p>
              <p><strong>Впевненість іі:</strong> {(result.confidence * 100).toFixed(2)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
