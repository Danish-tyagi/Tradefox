const { Server } = require('socket.io');
const { startPriceSimulator } = require('./priceSimulator');

const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Subscribe to specific symbols
    socket.on('subscribe', (symbols) => {
      symbols.forEach(sym => socket.join(`stock:${sym}`));
    });

    // Subscribe to ALL stock updates (dashboard, portfolio)
    socket.on('subscribe-all', () => {
      socket.join('all-stocks');
    });

    socket.on('unsubscribe', (symbols) => {
      symbols.forEach(sym => socket.leave(`stock:${sym}`));
    });

    socket.on('unsubscribe-all', () => {
      socket.leave('all-stocks');
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  startPriceSimulator(io);
};

module.exports = { createSocketServer };
