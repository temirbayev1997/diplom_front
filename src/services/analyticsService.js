// src/services/analyticsService.js (обновление)
import api from './api';

// Прогнозы загруженности
export const getPredictions = (gymId, date) => {
  return api.get(`/api/v1/analytics/predictions/?gym=${gymId}&date=${date}`);
};

export const getNextWeekPredictions = (gymId) => {
  return api.get(`/api/v1/analytics/predictions/next_week/${gymId ? '?gym=' + gymId : ''}`);
};

// Отчеты о посещаемости
export const getAttendanceReport = (gymId, startDate, endDate) => {
  return api.get(`/api/v1/analytics/reports/attendance/?gym=${gymId}&start_date=${startDate}&end_date=${endDate}`);
};

// Анализ часов пик
export const getPeakHours = (gymId, days = 30) => {
  return api.get(`/api/v1/analytics/predictions/peak_hours/?gym=${gymId}&days=${days}`);
};

// Сравнение залов
export const getGymComparison = (days = 30) => {
  return api.get(`/api/v1/analytics/predictions/gym_comparison/?days=${days}`);
};

// Расширенная аналитика
export const getExtendedAnalytics = (type = 'general', gymId, days = 30) => {
  let url = `/api/v1/analytics/extended-analytics/?type=${type}&days=${days}`;
  if (gymId) {
    url += `&gym=${gymId}`;
  }
  return api.get(url);
};

// Персональные рекомендации
export const getRecommendations = () => {
  return api.get('/api/v1/analytics/recommendations/');
};

// Предпочтения пользователя
export const getUserPreferences = () => {
  return api.get('/api/v1/analytics/user-preferences/');
};

export const updateUserPreferences = (preferenceId, data) => {
  return api.patch(`/api/v1/analytics/user-preferences/${preferenceId}/`, data);
};

export const createUserPreferences = (data) => {
  return api.post('/api/v1/analytics/user-preferences/', data);
};

// Рейтинги залов
export const getGymRatings = (gymId) => {
  return api.get(`/api/v1/analytics/gym-ratings/?gym=${gymId}`);
};

export const createOrUpdateRating = (data) => {
  return api.post('/api/v1/analytics/gym-ratings/', data);
};

export default {
  getPredictions,
  getNextWeekPredictions,
  getAttendanceReport,
  getPeakHours,
  getGymComparison,
  getExtendedAnalytics,
  getRecommendations,
  getUserPreferences,
  updateUserPreferences,
  createUserPreferences,
  getGymRatings,
  createOrUpdateRating
};