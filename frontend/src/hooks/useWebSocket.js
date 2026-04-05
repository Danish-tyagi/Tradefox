import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

let _socket = null;
let _refCount = 0;

const getSocket = () => {
  if (!_socket || _socket.disconnected) {
    _socket = io(import.meta.env.VITE_WS_URL, { transports: ['websocket'] });
  }
  return _socket;
};

const useWebSocket = (symbols = []) => {
  const queryClient = useQueryClient();
  const subscribeAll = symbols.length === 0;

  useEffect(() => {
    const socket = getSocket();
    _refCount++;

    const onPriceUpdate = (data) => {
      queryClient.setQueryData(['stock', data.symbol], (old) =>
        old ? { ...old, currentPrice: data.price, change: data.change, changePercent: data.changePercent } : old
      );
      queryClient.setQueryData(['stocks'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(s =>
          s.symbol === data.symbol
            ? { ...s, currentPrice: data.price, change: data.change, changePercent: data.changePercent }
            : s
        );
      });
      queryClient.setQueryData(['watchlist'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map(s =>
          s.symbol === data.symbol
            ? { ...s, currentPrice: data.price, change: data.change, changePercent: data.changePercent }
            : s
        );
      });
    };

    // LIMIT order auto-filled by price simulator
    const onOrderFilled = () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['portfolio']);
      queryClient.invalidateQueries(['portfolio-summary']);
    };

    // Price alert triggered
    const onPriceAlert = (data) => {
      queryClient.invalidateQueries(['alerts']);
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(`Price Alert: ${data.symbol}`, {
          body: `${data.symbol} is now ${data.condition === 'ABOVE' ? 'above' : 'below'} ₹${data.targetPrice} (Current: ₹${data.currentPrice})`,
        });
      }
    };

    const onConnect = () => {
      if (subscribeAll) {
        socket.emit('subscribe-all');
      } else {
        socket.emit('subscribe', symbols);
      }
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('priceUpdate', onPriceUpdate);
    socket.on('orderFilled', onOrderFilled);
    socket.on('priceAlert', onPriceAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('priceUpdate', onPriceUpdate);
      socket.off('orderFilled', onOrderFilled);
      socket.off('priceAlert', onPriceAlert);
      if (subscribeAll) {
        socket.emit('unsubscribe-all');
      } else {
        socket.emit('unsubscribe', symbols);
      }
      _refCount--;
      if (_refCount <= 0) {
        _socket?.disconnect();
        _socket = null;
        _refCount = 0;
      }
    };
  }, [subscribeAll ? 'all' : symbols.join(',')]);
};

export default useWebSocket;
