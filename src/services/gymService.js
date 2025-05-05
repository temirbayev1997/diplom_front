import api from './api';

export const getAll = () => {
  return api.get('/api/v1/gyms/');
};

export const searchByName = (name) => {
  return api.get(`/api/v1/gyms/?name=${encodeURIComponent(name)}`);
};

export const search = (query) => {
  return api.get(`/api/v1/gyms/?search=${encodeURIComponent(query)}`);
};

export const getById = (id) => {
  return api.get(`/api/v1/gyms/${id}/`);
};

export const getEquipment = (gymId) => {
  return api.get(`/api/v1/gyms/equipment/?gym=${gymId}`);
};

export const searchGymsByPost = (query) => {
  return api.post('/api/v1/gyms/search/', { query });
};

const gymService = {
  getAll,
  searchByName,
  search,
  getById,
  getEquipment
};

export default gymService;

export const API_URLS = {
  GYMS: '/api/v1/gyms/',
  GYM_DETAIL: (id) => `/api/v1/gyms/${id}/`,
  GYM_EQUIPMENT: '/api/v1/gyms/equipment/',
  ANALYTICS: '/api/v1/analytics/',
  BOOKINGS: '/api/v1/bookings/',
  USERS: '/api/v1/users/'
};