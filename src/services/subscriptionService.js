import api from './api';

export const getMySubscriptions = () => {
  return api.get('/api/v1/subscriptions/my-subscriptions/');
};

export const getMembershipPlans = () => {
  return api.get('/api/v1/subscriptions/membership-plans/');
};

export const getSubscriptionById = (id) => {
  return api.get(`/api/v1/subscriptions/${id}/`);
};

export const createSubscription = (subscriptionData) => {
  return api.post('/api/v1/subscriptions/', subscriptionData);
};

export const cancelSubscription = (id) => {
  return api.patch(`/api/v1/subscriptions/${id}/`, { status: 'cancelled' });
};