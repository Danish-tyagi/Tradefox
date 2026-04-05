import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useStockPrice = (symbol) => {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(null);
  const [changePercent, setChangePercent] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const socket = io(import.meta.env.VITE_WS_URL);

    socket.on('connect', () => {
      socket.emit('subscribe', [symbol]);
    });

    socket.on('priceUpdate', (data) => {
      if (data.symbol === symbol) {
        setPrice(data.price);
        setChange(data.change);
        setChangePercent(data.changePercent);
      }
    });

    return () => {
      socket.emit('unsubscribe', [symbol]);
      socket.disconnect();
    };
  }, [symbol]);

  return { price, change, changePercent };
};

export default useStockPrice;