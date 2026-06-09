import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import DailyQRCode from '../models/DailyQRCode.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();
const ADMIN = ['admin', 'super_admin'];

router.get('/today', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let qr = await DailyQRCode.findOne({ date: today });
    if (!qr) {
      const code = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);
      const qrDataURL = await QRCode.toDataURL(code, {
        width: 400,
        margin: 2,
        color: { dark: '#6366f1', light: '#ffffff' }
      });
      qr = await DailyQRCode.create({
        date: today,
        code,
        qrDataURL,
        expiresAt,
        generatedBy: req.user.id
      });
    }
    res.json(apiResponse(true, 'QR code retrieved', {
      _id: qr._id,
      date: qr.date,
      qrDataURL: qr.qrDataURL,
      code: qr.code,
      expiresAt: qr.expiresAt,
      isActive: qr.isActive,
      usedCount: qr.usedCount
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/regenerate', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const code = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);
    const qrDataURL = await QRCode.toDataURL(code, {
      width: 400, margin: 2,
      color: { dark: '#6366f1', light: '#ffffff' }
    });
    let qr = await DailyQRCode.findOne({ date: today });
    if (qr) {
      qr.code = code;
      qr.qrDataURL = qrDataURL;
      qr.expiresAt = expiresAt;
      qr.isActive = true;
      qr.usedCount = 0;
      qr.generatedBy = req.user.id;
      await qr.save();
    } else {
      qr = await DailyQRCode.create({
        date: today, code, qrDataURL, expiresAt, generatedBy: req.user.id
      });
    }
    res.json(apiResponse(true, 'QR code regenerated', {
      _id: qr._id, date: qr.date, qrDataURL: qr.qrDataURL, code: qr.code,
      expiresAt: qr.expiresAt, isActive: qr.isActive, usedCount: qr.usedCount
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/toggle', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const qr = await DailyQRCode.findOne({ date: today });
    if (!qr) return res.status(404).json(apiResponse(false, 'No QR code for today'));
    qr.isActive = !qr.isActive;
    await qr.save();
    res.json(apiResponse(true, `QR code ${qr.isActive ? 'activated' : 'deactivated'}`, qr));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/history', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const total = await DailyQRCode.countDocuments();
    const qrs = await DailyQRCode.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('generatedBy', 'name');
    res.json(apiResponse(true, 'QR code history retrieved', {
      qrs, total, page: parseInt(page), pages: Math.ceil(total / limit)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
