const prisma = require('../config/db');

// Generate simulated OHLC candle data from current price
const getCandles = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { interval = '5m', limit = 100 } = req.query;

    const stock = await prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    const candles = generateCandles(stock.currentPrice, stock.prevClose, parseInt(limit), interval);
    res.json({ symbol: stock.symbol, interval, candles });
  } catch (err) {
    next(err);
  }
};

function generateCandles(currentPrice, prevClose, count, interval) {
  const candles = [];
  const now = Math.floor(Date.now() / 1000);

  // Interval in seconds
  const intervalSecs = {
    '1m': 60, '5m': 300, '15m': 900,
    '1h': 3600, '1d': 86400,
  }[interval] || 300;

  let price = prevClose;
  const volatility = currentPrice * 0.008; // 0.8% volatility per candle

  for (let i = count; i >= 0; i--) {
    const time = now - i * intervalSecs;

    // Random walk toward currentPrice
    const drift = (currentPrice - price) / (i + 1) * 0.3;
    const change = drift + (Math.random() - 0.5) * volatility;

    const open = parseFloat(price.toFixed(2));
    price = Math.max(price + change, price * 0.95); // floor at -5%
    const close = parseFloat(price.toFixed(2));

    const high = parseFloat((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(2));
    const low  = parseFloat((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(2));
    const volume = Math.floor(Math.random() * 500000 + 100000);

    candles.push({ time, open, high, low, close, volume });
  }

  return candles;
}

module.exports = { getCandles };
