const prisma = require('../config/db');

const getWatchlist = async (req, res, next) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        stock: {
          select: { id: true, symbol: true, name: true, currentPrice: true, change: true, changePercent: true },
        },
      },
    });
    res.json({ watchlist: items.map((i) => i.stock) });
  } catch (err) {
    next(err);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { stockId } = req.body;
    const item = await prisma.watchlist.create({
      data: { userId: req.user.id, stockId },
    });
    res.status(201).json({ item });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already in watchlist' });
    next(err);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    await prisma.watchlist.deleteMany({
      where: { userId: req.user.id, stockId: req.params.stockId },
    });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
