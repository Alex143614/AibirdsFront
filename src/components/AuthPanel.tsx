import React, { useState } from 'react';
import './AuthPanel.css';

export default function AuthPanel() { 
  const [isLogin, setIsLogin] = useState(true);//----------булевкая переменная для отображения кнопки войти/выйти
  const [username, setUsername] = useState('');//----------для поля ввода названия
  const [password, setPassword] = useState('');//----------для поля ввода паролч
  const [error, setError] = useState('');//----------------для вывода сообщения об ошибки

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');//----------------------------------------------------------форма поведения елемента, для отправки данных на сервер

    //---isLogin - для проверки пользователь хочет видеть 
    //---'/api/auth/login' панель логина либо '/api/auth/register' регистрации
    const httpPath = isLogin ? '/api/auth/login' : '/api/auth/register';
    //---порт c# апи + конктретная функция логина или авторизации
    const fullUrl = "http://localhost:5208" + httpPath
    //---response - ответ от сервера с#
    //---fetch(fullUrl...) делаем фетч запрос к C# по порту и функции 
    //---method: 'POST' - тип запроса, application/json - передаем json 
    //---body: JSON.stringify({ username, password }), - отправляем запрос в виде json 
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      //---записываем ответ в текстовом формате внутри обьекта
      const textData = await response.text();
      //---проверяем статус код который вернул сервер 
      if (!response.ok) {
        throw new Error(textData || 'помилка авторизації');
      }
      //---это выполняеться только если все выше сработало и он пользователь логиниться а не авторизируеться и проверяем это через if (isLogin)
      if (isLogin) {
        //---data - имеет ответ преображенный в json либо пустоту если сервер ничего не вернул
        //---textData ? если ответ от сервера не пустой то JSON.parse(textData) преобрзовываем в json либо пустота {}
        const data = textData ? JSON.parse(textData) : {};
        //---если C# вернул токен то 
        if (data.token) {
          //---сохраняем токен в память браузера 
          localStorage.setItem('token', data.token);
          //---перезагружает страницу для соранения передачи токена в память
          window.location.reload(); 
        } else {
          throw new Error("Сервер не повернув токен");
        }
      //---если пользователь зарегистрировался а не логинился
      } else {
        alert('регистрація успішна, тепер зробіть логін');
        setIsLogin(true);
        setPassword('');
      }
    //---если ошибка
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('невідома помилка');
      }
    }
  };

  return (
    <div className="auth-panel">
      <h2 className="auth-title">{isLogin ? 'Увійти' : 'Зареєструватися'}</h2>
      
      {error && <p className="auth-error">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <input 
          type="text" 
          placeholder="імя користувача" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          className="auth-input"
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="auth-input"
        />
        <button type="submit" className="auth-submit-btn">
          {isLogin ? 'Увійти' : 'Зареєструватися'}
        </button>
      </form>

      <button 
        onClick={() => { setIsLogin(!isLogin); setError(''); }} 
        className="auth-switch-btn"
      >
        {isLogin ? 'нема аккаунта? Зареєструватися' : 'Вже є аккаунт? Увійти'}
      </button>
    </div>
  );
}