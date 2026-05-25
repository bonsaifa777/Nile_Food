import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRE } from '../shared/constants.js';

export const generateToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Set it in environment variables.');
  }
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Set it in environment variables.');
  }
  return jwt.verify(token, JWT_SECRET);
};

export const hashPassword = async (password) => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(password, hashedPassword);
};

export const apiResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode
  };
};

export const generateOrderId = () => {
  const prefix = 'NF';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const calculateDeliveryFee = (distance, baseFee = 50, perKm = 10) => {
  return baseFee + (distance * perKm);
};

export const generateTableQRCode = (tableId, restaurantId) => {
  return Buffer.from(JSON.stringify({ tableId, restaurantId })).toString('base64');
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const formatCurrency = (amount, currency = 'ETB') => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency
  }).format(amount);
};

export const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};
