import api from './api';

export const getMyBookings = () => {
  return api.get('/bookings/my_bookings/');
};

export const createBooking = (bookingData) => {
  return api.post('/bookings/', bookingData);
};

export const cancelBooking = (id) => {
  return api.patch(`/bookings/${id}/`, { status: 'cancelled' });
};