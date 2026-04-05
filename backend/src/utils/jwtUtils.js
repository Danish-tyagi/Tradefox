const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '15m'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

// Short-lived token for the "set password" email link (1 hour)
const generateSetPasswordToken = (userId) => {
  return jwt.sign({ userId, purpose: 'set-password' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Short-lived token for the "reset password" email link (1 hour)
const generatePasswordResetToken = (userId) => {
  return jwt.sign({ userId, purpose: 'reset-password' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, generateSetPasswordToken, generatePasswordResetToken };