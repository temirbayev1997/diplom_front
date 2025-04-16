import api from './api';

export const getAll = (params = {}) => {
  return api.get('/api/v1/gyms/', { params });
};

export const searchGyms = (query) => {
  return api.get(`/api/v1/gyms/?search=${query}`);
};

export const searchGymsByName = (name) => {
  return api.get(`/api/v1/gyms/?name=${name}`);
};

export const getById = (id) => {
  return api.get(`/api/v1/gyms/${id}/`);
};

export const getEquipment = (gymId) => {
  return api.get(`/api/v1/equipment/?gym=${gymId}`);
};

export const getReviews = (gymId) => {
  return api.get(`/api/v1/gyms/${gymId}/reviews/`);
};

export default {
  getAll,
  searchGyms,
  searchGymsByName,
  getById,
  getEquipment,
  getReviews
};