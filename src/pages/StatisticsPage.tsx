import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from 'recharts';//-------------------библиотеки для графиков
import './StatisticsPage.css';

//---порт на получение статистики
const BASE_URL = "http://localhost:5208/api/statistics";


const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

async function getData(path: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(BASE_URL + path, {
    headers: { 'Authorization': "Bearer " + token }
  });
  if (!response.ok) throw new Error('Ошибка загрузки статистики.');
  return response.json();
}

export default function StatisticsPage() {
  const [types, setTypes] = useState<{ name: string; value: number }[]>([]);//-------------статистика по тому какие запросы самые частые по изображению, инфо о птичке или ее пение
  const [users, setUsers] = useState<{ username: string; requestCount: number }[]>([]);//--статистика по тому какие пользователи делали самые частые запросы, это все в таблице MainPage
  const [birds, setBirds] = useState<{ species: string; requestCount: number }[]>([]);//---статистика по тому какие какие птицы чаще всего возвращала ии от изображений или аудио а так же от того на какой вид человек хочет получить доп информацию
  const [error, setError] = useState('');//------------------------------------------------для отображения ошибки

  useEffect(() => {
    const load = async () => {
      try {
        const usage = await getData('/get_type_usege');
        setTypes([
          { name: 'Зображеня', value: usage.image },
          { name: 'Спів', value: usage.sound },
          { name: 'Доп Інформація', value: usage.info },
        ]);
        setUsers(await getData('/top_users?page=1&pageSize=10'));
        setBirds(await getData('/top_birds?page=1&pageSize=10'));

      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="stats-page">
      <h1>Статистика</h1>
      {error && <p className="stats-error">{error}</p>}

      <div className="stats-card">
        <h2>Типи запросів</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={types} dataKey="value" nameKey="name" label>
              {types.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-card">
        <h2>Топ користувачів</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={users}>
            <XAxis dataKey="username" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="requestCount" name="Запросів" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-card">
        <h2>Топ видів птиць</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={birds}>
            <XAxis dataKey="species" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="requestCount" name="Запросів" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}