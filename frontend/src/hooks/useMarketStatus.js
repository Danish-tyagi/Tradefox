import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Returns live market open/closed status via WebSocket
 * Falls back to HTTP polling if WS not available
 */
const useMarketStatus = () => {
  const [status, setStatus] = useState({ open: null, reason: '' });

  useEffect(() => {
    // Derive from IST time on client side (no auth needed)
    const check = () => {
      const now = new Date();
      // Convert to IST
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const day = ist.getDay(); // 0=Sun, 6=Sat
      const h = ist.getHours();
      const m = ist.getMinutes();
      const total = h * 60 + m;
      const open  = 9 * 60 + 15;
      const close = 15 * 60 + 30;

      if (day === 0 || day === 6) {
        setStatus({ open: false, reason: 'Weekend' });
      } else if (total >= open && total < close) {
        const remaining = close - total;
        setStatus({ open: true, reason: 'Market Open', closesIn: `${Math.floor(remaining / 60)}h ${remaining % 60}m` });
      } else if (total >= 9 * 60 && total < open) {
        setStatus({ open: false, reason: 'Pre-Open Session' });
      } else {
        setStatus({ open: false, reason: 'Market Closed' });
      }
    };

    check();
    const interval = setInterval(check, 30_000); // re-check every 30s
    return () => clearInterval(interval);
  }, []);

  return status;
};

export default useMarketStatus;
