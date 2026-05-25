import express from 'express';
import Order from '../models/Order.js';
import { apiResponse } from '../../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, PAYMENT_STATUS, CHAPA_SECRET_KEY, CHAPA_BASE_URL } from '../../shared/constants.js';
import fetch from 'node-fetch';
import crypto from 'crypto';

const router = express.Router();

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { paymentStatus } = req.query;
    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .select('orderId user guestName total paymentMethod paymentStatus createdAt')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch payments'));
  }
});

router.post('/chapa/initiate', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json(apiResponse(false, 'Order ID is required'));
    }
    const order = await Order.findOne({ orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }

    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount: order.total,
        currency: 'ETB',
        email: req.user.email,
        first_name: req.user.name.split(' ')[0],
        last_name: req.user.name.split(' ').slice(1).join(' '),
        tx_ref: order.orderId,
        callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/callback`,
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/return?orderId=${order.orderId}`,
        customization: {
          title: 'Nile Food',
          description: `Order ${order.orderId}`
        }
      })
    });

    const data = await response.json();
    if (data.status === 'success') {
      res.json(apiResponse(true, '', { checkoutUrl: data.data.checkout_url, reference: data.data.reference }));
    } else {
      res.status(400).json(apiResponse(false, 'Payment initialization failed'));
    }
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Payment initialization failed'));
  }
});

function verifyChapaWebhookSignature(req) {
  const signature = req.headers['x-chapa-signature'];
  if (!signature || !CHAPA_SECRET_KEY) return false;
  try {
    const expected = crypto
      .createHmac('sha256', CHAPA_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

router.post('/chapa/webhook', async (req, res) => {
  try {
    if (!verifyChapaWebhookSignature(req)) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const { event, data } = req.body;
    if (event === 'transaction.success') {
      const order = await Order.findOne({ orderId: data.tx_ref });
      if (order) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.paymentReference = data.reference;
        await order.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

router.post('/bank-transfer', authenticate, async (req, res) => {
  try {
    const { orderId, receiptImage } = req.body;
    if (!orderId) {
      return res.status(400).json(apiResponse(false, 'Order ID is required'));
    }
    const order = await Order.findOne({ orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    order.paymentMethod = 'bank_transfer';
    order.paymentStatus = PAYMENT_STATUS.PENDING;
    await order.save();
    res.json(apiResponse(true, 'Bank transfer receipt uploaded. Pending verification.', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to process bank transfer'));
  }
});

router.put('/verify/:orderId', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = Object.values(PAYMENT_STATUS);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json(apiResponse(false, 'Invalid payment status'));
    }
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json(apiResponse(false, 'Order not found'));
    }
    order.paymentStatus = status;
    await order.save();
    res.json(apiResponse(true, 'Payment verified', order));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to verify payment'));
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, paymentStatus: { $ne: 'pending' } })
      .select('orderId total paymentMethod paymentStatus createdAt')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', orders));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch payment history'));
  }
});

export default router;
