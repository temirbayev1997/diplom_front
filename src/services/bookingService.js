import api from './api';

export const getMyBookings = () => {
  return api.get('/v1/bookings/my-bookings/');
};

export const getUpcomingBookings = () => {
  return api.get('/v1/bookings/upcoming/');
};

export const createBooking = (bookingData) => {
  return api.post('/v1/bookings/', bookingData);
};

export const getBookingById = (id) => {
  return api.get(`/v1/bookings/${id}/`);
};

export const updateBooking = (id, data) => {
  return api.patch(`/v1/bookings/${id}/`, data);
};

export const cancelBooking = (id) => {
  return api.patch(`/v1/bookings/${id}/`, { status: 'cancelled' });
};

export const deleteBooking = (id) => {
  return api.delete(`/v1/bookings/${id}/`);
};