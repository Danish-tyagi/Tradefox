import api from './api';

export const chartService = {
  getCandles: (symbol, interval, limit = 120) =>
    api.get(`/chart/${symbol}?interval=${interval}&limit=${limit}`).then((r) => r.data),
};
