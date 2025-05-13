// src/services/notificationService.js
import api from './api';

export const getNotifications = () => {
  return api.get('/api/v1/notifications/');
};

export const getUnreadNotifications = () => {
  return api.get('/api/v1/notifications/?is_read=false');
};

export const markAsRead = (notificationId) => {
  return api.patch(`/api/v1/notifications/${notificationId}/`, {
    is_read: true
  });
};

export const markAllAsRead = () => {
  return api.post('/api/v1/notifications/mark-all-read/');
};

export const getNotificationSettings = () => {
  return api.get('/api/v1/notifications/settings/');
};

export const updateNotificationSettings = (settingsId, data) => {
  return api.patch(`/api/v1/notifications/settings/${settingsId}/`, data);
};

export const createNotificationSettings = (data) => {
  return api.post('/api/v1/notifications/settings/', data);
};

const notificationService = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  createNotificationSettings
};

export default notificationService;