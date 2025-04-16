import api from './api';

export const getMyBookings = () => {
  return api.get('/api/v1/bookings/my-bookings/');
};

export const getUpcomingBookings = () => {
  return api.get('/api/v1/bookings/upcoming/');
};

export const createBooking = (bookingData) => {
  return api.post('/api/v1/bookings/', bookingData);
};

export const getBookingById = (id) => {
  return api.get(`/api/v1/bookings/${id}/`);
};

export const updateBooking = (id, data) => {
  return api.patch(`/api/v1/bookings/${id}/`, data);
};

export const cancelBooking = (id) => {
  return api.patch(`/api/v1/bookings/${id}/`, { status: 'cancelled' });
};

export const deleteBooking = (id) => {
  return api.delete(`/api/v1/bookings/${id}/`);
};