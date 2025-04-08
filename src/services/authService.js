import api from './api';

export const login = async (username, password) => {
  const response = await api.post('/token/', { username, password });
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
};

export const register = (userData) => {
  return api.post('/users/', userData);
};

export const getCurrentUser = () => {
  return api.get('/users/me/');
};