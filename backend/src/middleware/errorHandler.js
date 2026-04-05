const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.path}`);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

module.exports = { errorHandler };
