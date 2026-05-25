import express from 'express';
import Settings from '../models/Settings.js';
import { apiResponse } from '../../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../../shared/constants.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    const safe = settings.toObject();
    safe.chapaSecretKey = safe.chapaSecretKey ? '••••••••' + safe.chapaSecretKey.slice(-4) : '';
    res.json(apiResponse(true, '', safe));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch settings'));
  }
});

router.put('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    const allowedFields = [
      'restaurantName', 'email', 'phone', 'address',
      'deliveryFee', 'deliveryRadius', 'taxRate', 'currency', 'timezone',
      'paymentMethods', 'estimatedDeliveryTime', 'chapaSecretKey', 'chapaPublicKey'
    ];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    }
    await settings.save();
    const safe = settings.toObject();
    safe.chapaSecretKey = safe.chapaSecretKey ? '••••••••' + safe.chapaSecretKey.slice(-4) : '';
    res.json(apiResponse(true, 'Settings saved', safe));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to save settings'));
  }
});

export default router;
