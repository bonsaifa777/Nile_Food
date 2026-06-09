import express from 'express';
import CashDrawer from '../models/CashDrawer.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, CASH_DRAWER_EVENTS, POS_SOCKET_EVENTS } from '../shared/constants.js';

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CASHIER));

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const drawers = await CashDrawer.find(query)
      .populate('openedBy', 'name email')
      .populate('closedBy', 'name email')
      .populate('transactions.createdBy', 'name')
      .sort({ openedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CashDrawer.countDocuments(query);
    res.json(apiResponse(true, '', { drawers, total }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch cash drawers'));
  }
});

router.get('/current', async (req, res) => {
  try {
    let drawer = await CashDrawer.findOne({ status: 'open' })
      .populate('openedBy', 'name email')
      .populate('transactions.createdBy', 'name')
      .sort({ openedAt: -1 });

    if (!drawer) {
      return res.json(apiResponse(true, '', null));
    }

    const drawerObj = drawer.toObject();
    drawerObj.expectedBalance = drawer.calculateExpected();
    drawerObj.difference = drawerObj.closingBalance
      ? drawerObj.expectedBalance - drawerObj.closingBalance
      : 0;

    res.json(apiResponse(true, '', drawerObj));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch current drawer'));
  }
});

router.post('/open', async (req, res) => {
  try {
    const existingOpen = await CashDrawer.findOne({ status: 'open' });
    if (existingOpen) {
      return res.status(400).json(apiResponse(false, 'A cash drawer is already open. Close it first.'));
    }

    const { openingBalance, notes } = req.body;
    if (openingBalance === undefined) {
      return res.status(400).json(apiResponse(false, 'Opening balance is required'));
    }

    const drawer = new CashDrawer({
      openedBy: req.user._id,
      openingBalance,
      notes
    });

    drawer.transactions.push({
      type: CASH_DRAWER_EVENTS.OPEN,
      amount: openingBalance,
      reason: 'Opening balance',
      createdBy: req.user._id
    });

    await drawer.save();

    const populated = await CashDrawer.findById(drawer._id)
      .populate('openedBy', 'name email');

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.CASH_DRAWER_UPDATE, populated);
    }

    res.status(201).json(apiResponse(true, 'Cash drawer opened', populated));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to open cash drawer'));
  }
});

router.post('/:id/close', async (req, res) => {
  try {
    const drawer = await CashDrawer.findById(req.params.id);
    if (!drawer) return res.status(404).json(apiResponse(false, 'Cash drawer not found'));
    if (drawer.status === 'closed') return res.status(400).json(apiResponse(false, 'Cash drawer is already closed'));

    const { closingBalance, notes } = req.body;
    if (closingBalance === undefined) {
      return res.status(400).json(apiResponse(false, 'Closing balance is required'));
    }

    const expectedBalance = drawer.calculateExpected();
    drawer.closingBalance = closingBalance;
    drawer.expectedBalance = expectedBalance;
    drawer.difference = closingBalance - expectedBalance;
    drawer.status = 'closed';
    drawer.closedBy = req.user._id;
    drawer.closedAt = new Date();
    if (notes) drawer.notes = notes;

    drawer.transactions.push({
      type: CASH_DRAWER_EVENTS.CLOSE,
      amount: closingBalance,
      reason: 'Closing balance',
      createdBy: req.user._id
    });

    await drawer.save();

    const populated = await CashDrawer.findById(drawer._id)
      .populate('openedBy', 'name email')
      .populate('closedBy', 'name email')
      .populate('transactions.createdBy', 'name');

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.CASH_DRAWER_UPDATE, populated);
    }

    res.json(apiResponse(true, 'Cash drawer closed', populated));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to close cash drawer'));
  }
});

router.post('/:id/transaction', async (req, res) => {
  try {
    const drawer = await CashDrawer.findById(req.params.id);
    if (!drawer) return res.status(404).json(apiResponse(false, 'Cash drawer not found'));
    if (drawer.status === 'closed') return res.status(400).json(apiResponse(false, 'Cash drawer is closed'));

    const { type, amount, reason, reference } = req.body;
    if (!type || !amount) {
      return res.status(400).json(apiResponse(false, 'Type and amount are required'));
    }

    const validTypes = Object.values(CASH_DRAWER_EVENTS);
    if (!validTypes.includes(type)) {
      return res.status(400).json(apiResponse(false, 'Invalid transaction type'));
    }

    drawer.transactions.push({
      type,
      amount,
      reason,
      reference,
      createdBy: req.user._id
    });

    await drawer.save();

    const populated = await CashDrawer.findById(drawer._id)
      .populate('transactions.createdBy', 'name');

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.CASH_DRAWER_UPDATE, populated);
    }

    res.json(apiResponse(true, 'Transaction recorded', populated));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to record transaction'));
  }
});

router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.openedAt = {};
      if (startDate) query.openedAt.$gte = new Date(startDate);
      if (endDate) query.openedAt.$lte = new Date(endDate);
    }

    const history = await CashDrawer.find(query)
      .populate('openedBy', 'name email')
      .populate('closedBy', 'name email')
      .sort({ openedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CashDrawer.countDocuments(query);
    res.json(apiResponse(true, '', { history, total }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch drawer history'));
  }
});

export default router;
