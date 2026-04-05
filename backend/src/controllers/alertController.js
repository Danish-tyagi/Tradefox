const prisma = require('../config/db');

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: req.user.id },
      include: { stock: { select: { symbol: true, name: true, currentPrice: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const { stockId, condition, targetPrice } = req.body;
    if (!stockId || !condition || !targetPrice) {
      return res.status(400).json({ message: 'stockId, condition, and targetPrice are required' });
    }
    const alert = await prisma.priceAlert.create({
      data: { userId: req.user.id, stockId, condition, targetPrice: parseFloat(targetPrice) },
      include: { stock: { select: { symbol: true, name: true, currentPrice: true } } },
    });
    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await prisma.priceAlert.findUnique({ where: { id } });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await prisma.priceAlert.delete({ where: { id } });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, createAlert, deleteAlert };
