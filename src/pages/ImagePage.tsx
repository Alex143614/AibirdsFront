import React, { useState } from 'react';
import './ImagePage.css';

export default function ImagePage() {
  //---изображение которое я передаю
  const [imageUrl, setImageUrl] = useState('');
  //---ответ от сервера, вид птиці и увереность ии 
  const [result, setResult] = useState<{ species: string; confidence: number } | null>(null);
  //---для загрузки, чтобы через эту переменную показывать панель загрузки
  const [loading, setLoading] = useState(false);
  //----для возвращения сообщения ошибки
  const [error, setError] = useState('');

  
  const AnalyzeImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    //---проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не зареєстровані');
      setLoading(false);
      return;
    }
    //---фетч запрос на получение вида птицы от url
    try {
      const response = await fetch("http://localhost:5208/api/birds/image", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        throw new Error('Помилка від сервера');
      }

      const data = await response.json();
      
      //---Если C# вернул лимит
      if (data.species === "limit") {
        setError('Ліміт достигнут, чекайте день або купіть підписку');
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
    <div className="image-page">
      <h1>Аналіз зображеня птиці</h1>
      
      <form onSubmit={AnalyzeImage} className="image-form">
        <input 
          type="url" 
          placeholder="Вставьте url зображення (http://...)" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          className="image-input"
        />
        <button type="submit" disabled={loading} className="image-btn">
          {loading ? 'Аналізуємо...' : 'дізнатися вид птиці'}
        </button>
      </form>

      {error && <p className="image-error">{error}</p>}

      {imageUrl && (
        <div className="image-result-container">
          <div className="image-preview">
            <img src={imageUrl} alt="Ваше Зображення" onError={(e) => {
              (e.target as HTMLImageElement).src = '';
            }} />
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