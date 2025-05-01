import api from './api';

// Получение всех залов
export const getAll = () => {
  return api.get('/api/v1/gyms/');
};

// Поиск залов по названию или адресу
// В данном случае мы используем параметр запроса, так как в URL нет специального маршрута для поиска
export const searchByName = (name) => {
  return api.get(`/api/v1/gyms/?${encodeURIComponent(name)}`);
};

// Полный поиск по названию и адресу
export const search = (query) => {
  return api.get(`/api/v1/gyms/?${encodeURIComponent(query)}`);
};

// Получение конкретного зала по ID
export const getById = (id) => {
  return api.get(`/api/v1/gyms/${id}/`);
};

// Получение оборудования зала
export const getEquipment = (gymId) => {
  return api.get(`/api/v1/gyms/equipment/?gym=${gymId}`);
};

// Создание объекта с функциями
const gymService = {
  getAll,
  searchByName,
  search,
  getById,
  getEquipment
};

export default gymService;