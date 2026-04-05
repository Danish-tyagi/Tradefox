const prisma = require('../config/db');
const { matchOrder } = require('./orderMatchingService');

const placeOrder = async ({ userId, stockId, type, side, quantity, price }) => {
  const stock = await prisma.stock.findUnique({ where: { id: stockId } });
  if (!stock) throw Object.assign(new Error('Stock not found'), { status: 404 });

  const executionPrice = type === 'MARKET' ? stock.currentPrice : price;
  const totalCost = executionPrice * quantity;

  if (side === 'BUY') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.balance < totalCost)
      throw Object.assign(new Error('Insufficient balance'), { status: 400 });
  }

  const order = await prisma.order.create({
    data: { userId, stockId, type, side, quantity, price: executionPrice, status: 'PENDING' },
    include: { stock: true },
  });

  return matchOrder(order);
};

const getOrderHistory = (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: { stock: { select: { symbol: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

module.exports = { placeOrder, getOrderHistory };
