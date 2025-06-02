import React, { useState } from "react";
import api from '../services/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState("");

  // Универсальный обработчик для input
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post('api/v1/users/token/', formData);
      localStorage.setItem("token", res.data.access);
      window.location.href = "/admin-dashboard";
    } catch (err) {
      setError("Ошибка авторизации");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Логин"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Пароль"
      />
      <button type="submit">Войти</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
};

export default AdminLogin;
