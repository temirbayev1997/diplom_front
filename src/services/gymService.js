import api from './api';

// Получение всех залов
export const getAll = () => {
  return api.get('/v1/gyms/');
};

// Поиск залов только по названию
export const searchByName = (name) => {
  return api.get('/v1/gyms/', { params: { name } });
};

// Полный поиск по названию и адресу
export const search = (query) => {
  return api.get('/v1/gyms/', { params: { search: query } });
};

// Получение конкретного зала по ID
export const getById = (id) => {
  return api.get(`/v1/gyms/${id}/`);
};

// Получение оборудования зала
export const getEquipment = (gymId) => {
  return api.get('/v1/equipment/', { params: { gym: gymId } });
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