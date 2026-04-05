export const calculatePnL = (holdings, currentPrices = {}) => {
  return holdings.map((h) => {
    const current = currentPrices[h.stock.symbol] ?? h.stock.currentPrice;
    const invested = h.avgBuyPrice * h.quantity;
    const value = current * h.quantity;
    const pnl = value - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    return { ...h, currentValue: value, investedValue: invested, pnl, pnlPercent };
  });
};

export const totalPnL = (holdings, currentPrices = {}) => {
  const calculated = calculatePnL(holdings, currentPrices);
  const totalInvested = calculated.reduce((s, h) => s + h.investedValue, 0);
  const totalValue = calculated.reduce((s, h) => s + h.currentValue, 0);
  return {
    totalInvested,
    totalValue,
    pnl: totalValue - totalInvested,
    pnlPercent: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
  };
};