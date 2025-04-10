import axios from 'axios';

// Настройка базового URL для API
const api = axios.create({
  baseURL: '/api/v1',  // Префикс для всех запросов
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Функции API для залов
export const gymService = {
  getAll: () => api.get('/gyms/'),
  getById: (id) => api.get(`/gyms/${id}/`),
  getEquipment: (gymId) => api.get(`/gyms/equipment/?gym=${gymId}`)
};

// Другие сервисы API...

export default api;