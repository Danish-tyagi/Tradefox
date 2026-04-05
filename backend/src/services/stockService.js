const prisma = require('../config/db');

const getAllStocks = () =>
  prisma.stock.findMany({ orderBy: { symbol: 'asc' } });

const getStockBySymbol = (symbol) =>
  prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });

const searchStocks = (q = '') =>
  prisma.stock.findMany({
    where: {
      OR: [
        { symbol: { contains: q.toUpperCase() } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 10,
  });

module.exports = { getAllStocks, getStockBySymbol, searchStocks };
