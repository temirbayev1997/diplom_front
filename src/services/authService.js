import api from './api';

// Функция для авторизации пользователя
export const login = async (username, password) => {
  try {
    // Отправляем запрос на авторизацию
    const response = await api.post('/api/v1/users/token/', {
      username,
      password
    });
    
    // Сохраняем токены в localStorage
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      
      if (response.data.refresh) {
        localStorage.setItem('refresh', response.data.refresh);
      }
      
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
};

// Функция для выхода
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
};

// Функция для регистрации пользователя
export const register = async (userData) => {
  try {
    const response = await api.post('/api/v1/users/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
};

// Функция для проверки токена
export const checkAuth = () => {
  return !!localStorage.getItem('token');
};

// Функция для получения данных текущего пользователя
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/v1/users/me/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    throw error;
  }
};

export default {
  login,
  logout,
  register,
  checkAuth,
  getCurrentUser
};