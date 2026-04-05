import api from './api';
import axios from 'axios';

const publicApi = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const stockService = {
  getPublic: () => publicApi.get('/stocks/public').then((r) => r.data.stocks),
  getAll: () => api.get('/stocks').then((r) => r.data.stocks),
  getBySymbol: (symbol) => api.get(`/stocks/${symbol}`).then((r) => r.data.stock),
  search: (q) => api.get(`/stocks/search?q=${encodeURIComponent(q)}`).then((r) => r.data.stocks),
  addToWatchlist: (stockId) => api.post('/watchlist', { stockId }).then((r) => r.data),
  removeFromWatchlist: (stockId) => api.delete(`/watchlist/${stockId}`).then((r) => r.data),
  getWatchlist: () => api.get('/watchlist').then((r) => r.data.watchlist),
};