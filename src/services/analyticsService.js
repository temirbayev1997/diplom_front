// src/services/analyticsService.js
import api from './api';

export const getPredictions = (gymId, date) => {
  return api.get(`/analytics/predictions/?gym=${gymId}&date=${date}`);
};

export const getNextWeekPredictions = (gymId) => {
  return api.get(`/analytics/predictions/next_week/${gymId ? '?gym=' + gymId : ''}`);
};

export const getAttendanceReport = (gymId, startDate, endDate) => {
  return api.get(`/analytics/reports/attendance/?gym=${gymId}&start_date=${startDate}&end_date=${endDate}`);
};

export const getPeakHours = (gymId, days = 30) => {
  return api.get(`/analytics/predictions/peak_hours/?gym=${gymId}&days=${days}`);
};

export const getGymComparison = (days = 30) => {
  return api.get(`/analytics/predictions/gym_comparison/?days=${days}`);
};

export const getExtendedAnalytics = (type = 'general', gymId, days = 30) => {
  let url = `/analytics/extended-analytics/?type=${type}&days=${days}`;
  if (gymId) {
    url += `&gym=${gymId}`;
  }
  return api.get(url);
};

export const getRecommendations = () => {
  return api.get('/analytics/recommendations/');
};


export const getUserPreferences = () => {
  return api.get('/analytics/user-preferences/');
};

export const updateUserPreferences = (preferenceId, data) => {
  return api.patch(`/analytics/user-preferences/${preferenceId}/`, data);
};

export const createUserPreferences = (data) => {
  return api.post('/analytics/user-preferences/', data);
};

export const getGymRatings = (gymId) => {
  return api.get(`/analytics/gym-ratings/?gym=${gymId}`);
};

export const createOrUpdateRating = (data) => {
  return api.post('/analytics/gym-ratings/', data);
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