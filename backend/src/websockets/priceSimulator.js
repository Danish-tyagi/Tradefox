const prisma = require('../config/db');
const { matchOrder } = require('../services/orderMatchingService');
const { isMarketOpen } = require('../utils/marketHours');

// Sector volatility profiles — higher = more volatile
const SECTOR_VOLATILITY = {
  'IT':             0.008,
  'Banking':        0.007,
  'Finance':        0.009,
  'Energy':         0.006,
  'Auto':           0.007,
  'FMCG':           0.004,
  'Pharma':         0.006,
  'Metals':         0.010,
  'Conglomerate':   0.008,
  'Infrastructure': 0.006,
  'Cement':         0.006,
  'Paints':         0.005,
  'Consumer':       0.006,
  'Consumer Tech':  0.012,
  'Fintech':        0.011,
  'Retail':         0.007,
};

// Sector drift — shared market sentiment per sector per tick
const sectorDrift = {};

// Per-stock momentum (trending bias)
const stockMomentum = {};

// Simulated volume tracker
const stockVolume = {};

const getVolatility = (sector) => SECTOR_VOLATILITY[sector] || 0.007;

// Box-Muller transform for normal distribution
const randn = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Update sector drift every ~10 ticks (15s)
let tickCount = 0;
const updateSectorDrift = (sectors) => {
  sectors.forEach(sector => {
    // Sector drift: small random walk, mean-reverting
    const current = sectorDrift[sector] || 0;
    sectorDrift[sector] = current * 0.7 + randn() * 0.002;
  });
};

const startPriceSimulator = (io) => {
  setInterval(async () => {
    try {
      // When market is closed, emit status but don't move prices
      if (!isMarketOpen()) {
        io.emit('marketStatus', { open: false });
        return;
      }

      io.emit('marketStatus', { open: true });

      const stocks = await prisma.stock.findMany();
      tickCount++;

      // Update sector drifts every 10 ticks
      if (tickCount % 10 === 0) {
        const sectors = [...new Set(stocks.map(s => s.sector).filter(Boolean))];
        updateSectorDrift(sectors);
      }

      for (const stock of stocks) {
        const vol = getVolatility(stock.sector);
        const drift = sectorDrift[stock.sector] || 0;

        // Momentum: small trending bias that decays
        const momentum = stockMomentum[stock.id] || 0;
        stockMomentum[stock.id] = momentum * 0.85 + randn() * 0.001;

        // Price change = sector drift + stock-specific noise + momentum
        const stockNoise = randn() * vol;
        const changePercent = drift * 0.4 + stockNoise + momentum * 0.3;

        // Mean reversion: if price drifts too far from prevClose, pull back
        const deviation = (stock.currentPrice - stock.prevClose) / stock.prevClose;
        const reversion = -deviation * 0.02;

        const totalChange = changePercent + reversion;
        const newPrice = parseFloat((stock.currentPrice * (1 + totalChange)).toFixed(2));

        // Circuit breaker: ±20% from prevClose
        const upperCircuit = stock.prevClose * 1.20;
        const lowerCircuit = stock.prevClose * 0.80;
        const clampedPrice = Math.min(upperCircuit, Math.max(lowerCircuit, newPrice));

        const change = parseFloat((clampedPrice - stock.prevClose).toFixed(2));
        const changePct = parseFloat(((change / stock.prevClose) * 100).toFixed(2));

        // Simulate volume — higher on volatile moves
        const baseVolume = Math.floor(Math.random() * 5000) + 1000;
        const volMultiplier = 1 + Math.abs(totalChange) * 100;
        const tickVolume = Math.floor(baseVolume * volMultiplier);
        stockVolume[stock.id] = (stockVolume[stock.id] || 0) + tickVolume;

        await prisma.stock.update({
          where: { id: stock.id },
          data: { currentPrice: clampedPrice, change, changePercent: changePct },
        });

        const payload = {
          symbol: stock.symbol,
          price: clampedPrice,
          change,
          changePercent: changePct,
          volume: stockVolume[stock.id],
          tickVolume,
        };
        io.to(`stock:${stock.symbol}`).emit('priceUpdate', payload);
        io.to('all-stocks').emit('priceUpdate', payload);

        // ── Check price alerts ──
        const activeAlerts = await prisma.priceAlert.findMany({
          where: { stockId: stock.id, triggered: false },
        });
        for (const alert of activeAlerts) {
          const triggered =
            (alert.condition === 'ABOVE' && clampedPrice >= alert.targetPrice) ||
            (alert.condition === 'BELOW' && clampedPrice <= alert.targetPrice);
          if (triggered) {
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { triggered: true, triggeredAt: new Date() },
            });
            io.emit('priceAlert', {
              alertId: alert.id,
              userId: alert.userId,
              symbol: stock.symbol,
              condition: alert.condition,
              targetPrice: alert.targetPrice,
              currentPrice: clampedPrice,
            });
          }
        }

        // ── Re-check PENDING limit/SL orders ──
        const pendingOrders = await prisma.order.findMany({
          where: { stockId: stock.id, status: 'PENDING', type: { in: ['LIMIT', 'SL', 'SLM'] } },
        });

        for (const order of pendingOrders) {
          let shouldFill = false;

          if (order.type === 'LIMIT') {
            shouldFill =
              (order.side === 'BUY'  && order.price >= clampedPrice) ||
              (order.side === 'SELL' && order.price <= clampedPrice);
          } else if (order.type === 'SL' || order.type === 'SLM') {
            const triggered =
              (order.side === 'SELL' && clampedPrice <= order.triggerPrice) ||
              (order.side === 'BUY'  && clampedPrice >= order.triggerPrice);
            if (triggered) {
              shouldFill = order.type === 'SLM' || order.price <= clampedPrice;
            }
          }

          if (shouldFill) {
            try {
              const execPrice = order.type === 'SLM' ? clampedPrice : order.price;
              await matchOrder({ ...order, price: execPrice });
              io.emit('orderFilled', {
                orderId: order.id,
                userId: order.userId,
                symbol: stock.symbol,
                side: order.side,
                quantity: order.quantity,
                price: execPrice,
              });
            } catch {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: 'CANCELLED' },
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Price simulator error:', err);
    }
  }, 1500);
};

module.exports = { startPriceSimulator };
