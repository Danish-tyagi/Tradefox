import api from './api';

export const alertService = {
  getAll: () => api.get('/alerts').then(r => r.data.alerts),
  create: (data) => api.post('/alerts', data).then(r => r.data.alert),
  delete: (id) => api.delete(`/alerts/${id}`).then(r => r.data),
};
