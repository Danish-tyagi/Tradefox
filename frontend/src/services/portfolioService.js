import api from './api';

export const portfolioService = {
  getHoldings: () => api.get('/portfolio/holdings').then((r) => r.data.holdings),
  getSummary: () => api.get('/portfolio/summary').then((r) => r.data),
};