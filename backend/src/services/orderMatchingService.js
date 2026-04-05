const prisma = require('../config/db');

/**
 * Basic order matching engine simulation.
 * - MARKET orders fill immediately at current price.
 * - LIMIT orders fill if price condition is met.
 */
const matchOrder = async (order) => {
  const stock = await prisma.stock.findUnique({ where: { id: order.stockId } });
  const shouldFill =
    order.type === 'MARKET' ||
    (order.side === 'BUY'  && order.price >= stock.currentPrice) ||
    (order.side === 'SELL' && order.price <= stock.currentPrice);

  if (!shouldFill) {
    return prisma.order.update({ where: { id: order.id }, data: { status: 'PENDING' } });
  }

  // Use actual current price for MARKET orders
  const execPrice = order.type === 'MARKET' ? stock.currentPrice : order.price;
  const totalCost = execPrice * order.quantity;

  try {
    return await prisma.$transaction(async (tx) => {
      const filled = await tx.order.update({
        where: { id: order.id },
        data: { status: 'FILLED', filledAt: new Date(), price: execPrice },
        include: { stock: true },
      });

      if (order.side === 'BUY') {
        await tx.user.update({
          where: { id: order.userId },
          data: { balance: { decrement: totalCost } },
        });

        const existing = await tx.portfolio.findUnique({
          where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
        });

        if (existing) {
          const newQty = existing.quantity + order.quantity;
          const newAvg = ((existing.avgBuyPrice * existing.quantity) + totalCost) / newQty;
          await tx.portfolio.update({
            where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
            data: { quantity: newQty, avgBuyPrice: newAvg },
          });
        } else {
          await tx.portfolio.create({
            data: { userId: order.userId, stockId: order.stockId, quantity: order.quantity, avgBuyPrice: execPrice },
          });
        }
      } else {
        // SELL
        const holding = await tx.portfolio.findUnique({
          where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
        });

        if (!holding || holding.quantity < order.quantity) {
          throw new Error('Insufficient holdings to sell');
        }

        await tx.user.update({
          where: { id: order.userId },
          data: { balance: { increment: totalCost } },
        });

        const newQty = holding.quantity - order.quantity;
        if (newQty === 0) {
          await tx.portfolio.delete({
            where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
          });
        } else {
          await tx.portfolio.update({
            where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
            data: { quantity: newQty },
          });
        }
      }

      return filled;
    });
  } catch (err) {
    // If matching fails (e.g. insufficient holdings), cancel the order
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });
    throw err;
  }
};

module.exports = { matchOrder };