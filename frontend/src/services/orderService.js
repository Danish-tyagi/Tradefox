import api from './api';

export const orderService = {
  place: (orderData) => api.post('/orders', orderData).then((r) => r.data),
  getHistory: () => api.get('/orders/history').then((r) => r.data.orders),
  cancel: (orderId) => api.put(`/orders/${orderId}/cancel`).then((r) => r.data),
  modify: (orderId, data) => api.put(`/orders/${orderId}/modify`, data).then((r) => r.data),
};