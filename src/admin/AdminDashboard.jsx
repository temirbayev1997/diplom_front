import React, { useEffect, useState } from "react";
import { fetchAdminStats } from "../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetchAdminStats().then(res => setStats(res.data));
  }, []);
  if (!stats) return <div>Загрузка...</div>;
  return (
    <div>
      <h1>Админ-панель</h1>
      <div>Пользователей: {stats.total_users}</div>
      <div>Бронирований: {stats.total_bookings}</div>
      <ul>
        {stats.gyms.map(g => <li key={g.name}>{g.name}: {g.capacity} чел.</li>)}
      </ul>
    </div>
  );
}
