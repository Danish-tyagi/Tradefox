import api from './api';

export const fundService = {
  add: (amount) => api.post('/funds/add', { amount }).then(r => r.data),
  withdraw: (amount) => api.post('/funds/withdraw', { amount }).then(r => r.data),
};
