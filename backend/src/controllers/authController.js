const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashUtils');
const { generateAccessToken, generateRefreshToken, generateSetPasswordToken, generatePasswordResetToken, verifyToken } = require('../utils/jwtUtils');
const { sendSetPasswordEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Send welcome email (non-blocking — don't fail signup if email fails)
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error('Welcome email failed:', err.message);
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 * Accepts { name, email } — creates an unverified user and emails a set-password link.
 */
const register = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Create user without a password yet; mark as unverified
    const user = await prisma.user.create({
      data: { name, email, password: '', isVerified: false },
    });

    // Generate a secure JWT (1 hour expiry)
    const token = generateSetPasswordToken(user.id);

    // Persist token + expiry for server-side validation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendSetPasswordEmail(email, token);

    res.status(201).json({ message: 'Registration successful. Check your email to set your password.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/set-password
 * Accepts { token, password } — validates the JWT and sets the user's password.
 */
const setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = verifyToken(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (payload.purpose !== 'set-password') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.passwordResetToken !== token) {
      return res.status(400).json({ message: 'Token already used or invalid' });
    }

    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        isVerified: true,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({ message: 'Password set successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, register, setPassword, forgotPassword, resetPassword };

/**
 * POST /api/auth/forgot-password
 * Accepts { email } — sends a password reset link if the account exists.
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = generatePasswordResetToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, token);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 * Accepts { token, password } — validates the JWT and updates the password.
 */
async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = verifyToken(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (payload.purpose !== 'reset-password') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.passwordResetToken !== token) {
      return res.status(400).json({ message: 'Token already used or invalid' });
    }

    if (user.passwordResetExpiry < new Date()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    const hashed = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
}
