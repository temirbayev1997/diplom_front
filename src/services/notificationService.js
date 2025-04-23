// src/services/notificationService.js
import api from './api';

// Получение всех уведомлений пользователя
export const getNotifications = () => {
  return api.get('/api/v1/notifications/');
};

// Получение непрочитанных уведомлений
export const getUnreadNotifications = () => {
  return api.get('/api/v1/notifications/?is_read=false');
};

// Отметить уведомление как прочитанное
export const markAsRead = (notificationId) => {
  return api.patch(`/api/v1/notifications/${notificationId}/`, {
    is_read: true
  });
};

// Отметить все уведомления как прочитанные
export const markAllAsRead = () => {
  return api.post('/api/v1/notifications/mark-all-read/');
};

// Получение настроек уведомлений
export const getNotificationSettings = () => {
  return api.get('/api/v1/notifications/settings/');
};

// Обновление настроек уведомлений
export const updateNotificationSettings = (settingsId, data) => {
  return api.patch(`/api/v1/notifications/settings/${settingsId}/`, data);
};

// Создание настроек уведомлений (если не существуют)
export const createNotificationSettings = (data) => {
  return api.post('/api/v1/notifications/settings/', data);
};

// Объект с функциями для экспорта
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