import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Полный URL вместо относительного пути
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена авторизации
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок и обновления токена
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Если ошибка 401 (Unauthorized) и не пытались обновить токен
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const response = await axios.post('/api/v1/users/token/refresh/', {
            refresh: refreshToken
          });
          
          // Сохраняем новый токен
          if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            
            // Обновляем заголовок и повторяем запрос
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Если не удалось обновить токен, выходим из системы
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Логгируем ошибки
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;