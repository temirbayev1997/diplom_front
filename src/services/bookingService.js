import api from './api';

// Получение бронирований текущего пользователя
export const getMyBookings = () => {
  return api.get('/api/v1/bookings/my-bookings/');
};

// Получение предстоящих бронирований
export const getUpcomingBookings = () => {
  return api.get('/api/v1/bookings/upcoming/');
};

// Создание нового бронирования
export const createBooking = (bookingData) => {
  return api.post('/api/v1/bookings/', bookingData);
};

// Получение конкретного бронирования по ID
export const getBookingById = (id) => {
  return api.get(`/api/v1/bookings/${id}/`);
};

// Обновление бронирования
export const updateBooking = (id, data) => {
  return api.patch(`/api/v1/bookings/${id}/`, data);
};

// Отмена бронирования
export const cancelBooking = (id) => {
  return api.patch(`/api/v1/bookings/${id}/`, { status: 'cancelled' });
};

// Удаление бронирования
export const deleteBooking = (id) => {
  return api.delete(`/api/v1/bookings/${id}/`);
};

export default {
  getMyBookings,
  getUpcomingBookings,
  createBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking
};