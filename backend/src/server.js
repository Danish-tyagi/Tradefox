const app = require('./app');
const { createSocketServer } = require('./websockets/socketServer');
const http = require('http');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

createSocketServer(server);

server.listen(PORT, () => {
  console.log(`TradeFox server running on port ${PORT}`);
});