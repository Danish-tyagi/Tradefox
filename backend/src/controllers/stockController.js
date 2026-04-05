const prisma = require('../config/db');

const getAllStocks = async (req, res, next) => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
    });
    res.json({ stocks });
  } catch (err) {
    next(err);
  }
};

const getStockBySymbol = async (req, res, next) => {
  try {
    const stock = await prisma.stock.findUnique({
      where: { symbol: req.params.symbol.toUpperCase() },
    });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json({ stock });
  } catch (err) {
    next(err);
  }
};

const searchStocks = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const stocks = await prisma.stock.findMany({
      where: {
        OR: [
          { symbol: { contains: q.toUpperCase() } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    res.json({ stocks });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStocks, getStockBySymbol, searchStocks };