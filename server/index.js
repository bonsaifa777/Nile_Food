import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import os from 'os';
import { MONGODB_URI } from './shared/constants.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import foodRoutes from './routes/food.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';
import tableRoutes from './routes/table.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import staffRoutes from './routes/staff.js';
import notificationRoutes from './routes/notification.js';
import contentRoutes from './routes/content.js';
import reservationRoutes from './routes/reservation.js';
import settingsRoutes from './routes/settings.js';
import inventoryRoutes from './routes/inventory.js';
import contactRoutes from './routes/contact.js';
import { setupSocket } from './utils/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const lanEnv = path.join(__dirname, '.env.lan');
if (fs.existsSync(lanEnv)) {
  dotenv.config({ path: lanEnv, override: true });
}

const app = express();
const httpServer = createServer(app);

const isOffline = process.env.OFFLINE_MODE === 'true';

const allowedOrigins = isOffline
  ? '*'
  : process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5001'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

if (isOffline) {
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
} else {
  app.use(helmet());
}

app.use(cors({
  origin: allowedOrigins === '*' ? true : allowedOrigins,
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
  req.io = io;
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

app.use('/uploads', express.static('uploads'));

if (!isOffline) {
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Nile Food API is running' });
});

if (isOffline) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  const adminDist = path.join(__dirname, '..', 'admin', 'dist');

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'lan-index.html'));
  });

  app.use('/admin', express.static(adminDist));
  app.use(express.static(clientDist));

  app.get('/admin/*', (req, res, next) => {
    if (req.path.startsWith('/admin/api/') || req.path.startsWith('/admin/uploads/') || req.path.startsWith('/admin/socket.io/')) {
      return next();
    }
    res.sendFile(path.join(adminDist, 'index.html'));
  });

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/socket.io/')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  app.use((err, req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });
}

setupSocket(io);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }

  const hotspotIps = addresses.filter(ip =>
    ip.startsWith('192.168.') || ip.startsWith('172.') || ip.startsWith('10.')
  );
  const isHotspot = addresses.some(ip =>
    ip.startsWith('172.20.10.') || ip.startsWith('192.168.43.') || ip.startsWith('192.168.254.')
  );

  console.log('\n========================================');
  console.log(`  ${isOffline ? 'NILE FOOD - OFFLINE LAN MODE' : 'NILE FOOD SERVER'}`);
  console.log('========================================');
  console.log(`  Local:    http://localhost:${PORT}`);
  addresses.forEach(ip => {
    console.log(`  Network:  http://${ip}:${PORT}`);
  });
  if (isOffline) {
    console.log('  Admin:    http://<lan-ip>:' + PORT + '/admin');
  }
  console.log('========================================\n');

  if (addresses.length === 0 && os.platform() === 'darwin') {
    console.log('  ⚠ No network IPs detected.');
    console.log('  If connecting via hotspot, check macOS firewall:');
    console.log('  System Settings → Network → Firewall → Allow incoming connections');
    console.log('  Or run: sudo /usr/libexec/ApplicationFirewall/socketfilterfw');
    console.log('    --add "$(which node)" --allow\n');
  }

  if (isHotspot && isOffline) {
    console.log('  Hotspot detected — open this URL on connected devices:\n');
    hotspotIps.forEach(ip => {
      console.log(`  ▶ http://${ip}:${PORT}/kiosk`);
    });
    console.log('');
  }

  if (isOffline) {
    console.log('  Credentials:');
    console.log('  Super Admin: admin@foodapp.com / Admin@123');
    console.log('  Manager:     manager@foodapp.com / Admin@123');
    console.log('  Kitchen:     kitchen@foodapp.com / Admin@123');
    console.log('  Driver:      driver@foodapp.com / Admin@123');
    console.log('========================================\n');
  }
});
