require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'tradefox_jwt_secret_key_2024',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'tradefox_refresh_secret_2024',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Warning: env variable ${key} is not set.`);
  }
});

module.exports = env;