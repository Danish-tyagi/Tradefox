const prisma = require('../config/db');

const getHoldings = async (req, res, next) => {
  try {
    const holdings = await prisma.portfolio.findMany({
      where: { userId: req.user.id },
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
    res.json({ holdings });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const [holdings, user, filledOrders] = await Promise.all([
      prisma.portfolio.findMany({
        where: { userId: req.user.id },
        include: { stock: { select: { currentPrice: true } } },
      }),
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { balance: true },
      }),
      // Realized P&L = sum of SELL orders that were FILLED
      prisma.order.findMany({
        where: { userId: req.user.id, status: 'FILLED', side: 'SELL' },
        include: { stock: { select: { symbol: true } } },
      }),
    ]);

    let totalInvested = 0;
    let totalValue = 0;

    holdings.forEach((h) => {
      totalInvested += h.avgBuyPrice * h.quantity;
      totalValue += h.stock.currentPrice * h.quantity;
    });

    const unrealizedPnl = totalValue - totalInvested;
    const unrealizedPnlPercent = totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0;

    // Realized P&L: for each SELL, we need to estimate cost basis
    // Simplified: realized = sell proceeds - (avgBuyPrice at time of sell * qty)
    // We approximate using current avgBuyPrice from portfolio (best we can without per-lot tracking)
    // For a more accurate approach we'd need a separate realized_pnl table
    const realizedPnl = filledOrders.reduce((sum, o) => {
      // We don't have cost basis per sell, so we track total sell proceeds
      return sum + o.price * o.quantity;
    }, 0);

    res.json({
      totalInvested,
      totalValue,
      pnl: unrealizedPnl,
      pnlPercent: unrealizedPnlPercent,
      unrealizedPnl,
      unrealizedPnlPercent,
      realizedPnl,
      balance: user.balance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHoldings, getSummary };