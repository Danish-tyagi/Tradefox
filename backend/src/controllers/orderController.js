const prisma = require('../config/db');
const { matchOrder } = require('../services/orderMatchingService');

const placeOrder = async (req, res, next) => {
  try {
    const { stockId, type, side, quantity, price, triggerPrice } = req.body;
    const userId = req.user.id;

    const stock = await prisma.stock.findUnique({ where: { id: stockId } });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    // Validate SL/SLM require triggerPrice
    if ((type === 'SL' || type === 'SLM') && !triggerPrice) {
      return res.status(400).json({ message: 'Trigger price is required for Stop-Loss orders' });
    }

    const executionPrice = type === 'MARKET' || type === 'SLM' ? stock.currentPrice : price;
    const totalCost = executionPrice * quantity;

    // Pre-checks before creating order
    if (side === 'BUY') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user.balance < totalCost) {
        return res.status(400).json({ message: `Insufficient balance. Need ${totalCost.toFixed(2)}, have ${user.balance.toFixed(2)}` });
      }
    }

    if (side === 'SELL') {
      const holding = await prisma.portfolio.findUnique({
        where: { userId_stockId: { userId, stockId } },
      });
      if (!holding || holding.quantity < quantity) {
        return res.status(400).json({
          message: `Insufficient holdings. You have ${holding?.quantity || 0} shares of ${stock.symbol}`,
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId, stockId, type, side, quantity,
        price: executionPrice,
        triggerPrice: triggerPrice ? parseFloat(triggerPrice) : null,
        status: 'PENDING',
      },
      include: { stock: true },
    });

    // SL/SLM orders wait for trigger — don't match immediately
    if (type === 'SL' || type === 'SLM') {
      return res.status(201).json({ order });
    }

    try {
      const filled = await matchOrder(order);
      return res.status(201).json({ order: filled });
    } catch (matchErr) {
      const cancelled = await prisma.order.findUnique({
        where: { id: order.id },
        include: { stock: true },
      });
      return res.status(400).json({ message: matchErr.message, order: cancelled });
    }
  } catch (err) {
    next(err);
  }
};

const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { stock: { select: { symbol: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (order.status !== 'PENDING') return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });

    const cancelled = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { stock: true },
    });

    res.json({ order: cancelled });
  } catch (err) {
    next(err);
  }
};

const modifyOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, triggerPrice, quantity } = req.body;
    const order = await prisma.order.findUnique({ where: { id }, include: { stock: true } });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (order.status !== 'PENDING') return res.status(400).json({ message: `Cannot modify a ${order.status} order` });
    if (order.type === 'MARKET') return res.status(400).json({ message: 'Cannot modify a MARKET order' });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(price    !== undefined && { price: parseFloat(price) }),
        ...(triggerPrice !== undefined && { triggerPrice: parseFloat(triggerPrice) }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
      },
      include: { stock: true },
    });

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getOrderHistory, cancelOrder, modifyOrder };
