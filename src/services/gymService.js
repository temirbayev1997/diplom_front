import api from './api';

export const getAllGyms = () => {
  return api.get('/gyms/');
};

export const getGymById = (id) => {
  return api.get(`/gyms/${id}/`);
};

export const getGymEquipment = (gymId) => {
  return api.get(`/equipment/?gym=${gymId}`);
};