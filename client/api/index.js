import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { MONGODB_URI } from '../server/shared/constants.js';
import authRoutes from '../server/routes/auth.js';
import userRoutes from '../server/routes/user.js';
import foodRoutes from '../server/routes/food.js';
import categoryRoutes from '../server/routes/category.js';
import orderRoutes from '../server/routes/order.js';
import tableRoutes from '../server/routes/table.js';
import paymentRoutes from '../server/routes/payment.js';
import adminRoutes from '../server/routes/admin.js';
import staffRoutes from '../server/routes/staff.js';
import notificationRoutes from '../server/routes/notification.js';
import contentRoutes from '../server/routes/content.js';
import reservationRoutes from '../server/routes/reservation.js';
import settingsRoutes from '../server/routes/settings.js';
import inventoryRoutes from '../server/routes/inventory.js';
import contactRoutes from '../server/routes/contact.js';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['https://nilefood.vercel.app', 'https://nilefood-admin.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/login', authLimiter);

app.use((req, res, next) => {
  req.io = null;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', contentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Nile Food API is running' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV !== 'production' ? err.message : undefined });
});

export default async function handler(req, res) {
  await connectDB();
  app(req, res);
}
