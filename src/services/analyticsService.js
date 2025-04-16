import api from './api';

export const getPredictions = (gymId, date) => {
  return api.get(`/api/v1/analytics/predictions/?gym=${gymId}&date=${date}`);
};

export const getNextWeekPredictions = (gymId) => {
  return api.get(`/api/v1/analytics/predictions/next_week/?gym=${gymId}`);
};

export const getAttendanceReport = (gymId, startDate, endDate) => {
  return api.get(`/api/v1/analytics/reports/attendance/?gym=${gymId}&start_date=${startDate}&end_date=${endDate}`);
};

export default {
  getPredictions,
  getNextWeekPredictions,
  getAttendanceReport
};