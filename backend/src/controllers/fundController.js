const prisma = require('../config/db');

const MAX_BALANCE = 10_000_000; // 1 crore cap
const MIN_WITHDRAW = 100;

const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (amt > 500_000) return res.status(400).json({ message: 'Max single deposit is ₹5,00,000' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { balance: true } });
    if (user.balance + amt > MAX_BALANCE) {
      return res.status(400).json({ message: `Balance cannot exceed ₹${MAX_BALANCE.toLocaleString('en-IN')}` });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { balance: { increment: amt } },
      select: { balance: true },
    });

    res.json({ balance: updated.balance, message: `₹${amt.toLocaleString('en-IN')} added successfully` });
  } catch (err) {
    next(err);
  }
};

const withdrawFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt < MIN_WITHDRAW) return res.status(400).json({ message: `Minimum withdrawal is ₹${MIN_WITHDRAW}` });

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { balance: true } });
    if (user.balance < amt) {
      return res.status(400).json({ message: `Insufficient balance. Available: ₹${user.balance.toLocaleString('en-IN')}` });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { balance: { decrement: amt } },
      select: { balance: true },
    });

    res.json({ balance: updated.balance, message: `₹${amt.toLocaleString('en-IN')} withdrawn successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { addFunds, withdrawFunds };
