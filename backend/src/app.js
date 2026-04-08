require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const chartRoutes = require('./routes/chartRoutes');
const alertRoutes = require('./routes/alertRoutes');
const fundRoutes = require('./routes/fundRoutes');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/stocks', apiLimiter, stockRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/portfolio', apiLimiter, portfolioRoutes);
app.use('/api/watchlist', apiLimiter, watchlistRoutes);
app.use('/api/chart', apiLimiter, chartRoutes);
app.use('/api/alerts', apiLimiter, alertRoutes);
app.use('/api/funds', apiLimiter, fundRoutes);

app.use(errorHandler);

module.exports = app;