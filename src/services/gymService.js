import api from './api';

// Получение всех залов
export const getAll = () => {
  return api.get('/api/v1/gyms/');
};

// Поиск залов только по названию
export const searchByName = (name) => {
  return api.get(`/api/v1/gyms/?name=${encodeURIComponent(name)}`);
};

// Полный поиск по названию и адресу
export const search = (query) => {
  return api.get(`/api/v1/gyms/?search=${encodeURIComponent(query)}`);
};

// Получение конкретного зала по ID
export const getById = (id) => {
  return api.get(`/api/v1/gyms/${id}/`);
};

// Получение оборудования зала
export const getEquipment = (gymId) => {
  return api.get(`/api/v1/equipment/?gym=${gymId}`);
};

// Получение отзывов о зале
export const getReviews = (gymId) => {
  return api.get(`/api/v1/gyms/${gymId}/reviews/`);
};

// Создание объекта с функциями
const gymService = {
  getAll,
  searchByName,
  search,
  getById,
  getEquipment,
  getReviews
};

export default gymService;