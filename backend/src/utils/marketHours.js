/**
 * Market Hours utility — NSE/BSE: 9:15 AM to 3:30 PM IST, Mon–Fri
 */

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30

const getISTDate = () => new Date(Date.now() + IST_OFFSET);

const isMarketOpen = () => {
  const now = getISTDate();
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;

  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;

  const open  = 9 * 60 + 15;  // 9:15 AM
  const close = 15 * 60 + 30; // 3:30 PM

  return totalMinutes >= open && totalMinutes < close;
};

const getMarketStatus = () => {
  const now = getISTDate();
  const day = now.getUTCDay();

  if (day === 0 || day === 6) {
    return { open: false, reason: 'Weekend', nextOpen: 'Monday 9:15 AM IST' };
  }

  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;

  const open  = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  const preOpen = 9 * 60; // 9:00 AM pre-open

  if (totalMinutes < preOpen) {
    return { open: false, reason: 'Pre-Market', nextOpen: '9:15 AM IST' };
  }
  if (totalMinutes >= preOpen && totalMinutes < open) {
    return { open: false, reason: 'Pre-Open Session', nextOpen: '9:15 AM IST' };
  }
  if (totalMinutes >= open && totalMinutes < close) {
    const remaining = close - totalMinutes;
    return { open: true, reason: 'Market Open', closesIn: `${Math.floor(remaining / 60)}h ${remaining % 60}m` };
  }
  return { open: false, reason: 'Market Closed', nextOpen: 'Tomorrow 9:15 AM IST' };
};

module.exports = { isMarketOpen, getMarketStatus, getISTDate };
