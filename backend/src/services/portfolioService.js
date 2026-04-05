const prisma = require('../config/db');

const getHoldings = (userId) =>
  prisma.portfolio.findMany({
    where: { userId },
    include: {
      stock: {
        select: {
          id: true, symbol: true, name: true,
          currentPrice: true, prevClose: true,
          change: true, changePercent: true,
        },
      },
    },
  });

const getSummary = async (userId) => {
  const [holdings, user] = await Promise.all([
    prisma.portfolio.findMany({
      where: { userId },
      include: { stock: { select: { currentPrice: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { balance: true } }),
  ]);

  let totalInvested = 0;
  let totalValue = 0;
  holdings.forEach((h) => {
    totalInvested += h.avgBuyPrice * h.quantity;
    totalValue += h.stock.currentPrice * h.quantity;
  });

  const pnl = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return { totalInvested, totalValue, pnl, pnlPercent, balance: user.balance };
};

module.exports = { getHoldings, getSummary };
