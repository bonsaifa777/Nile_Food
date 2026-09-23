import express from 'express';
import Inventory from '../models/Inventory.js';
import InventoryMovement from '../models/InventoryMovement.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

const STAFF_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF];

const getPeriodStart = (period) => {
  const now = new Date();
  if (period === 'day') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'week') {
    const d = new Date(now);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (period === 'year') {
    return new Date(now.getFullYear(), 0, 1);
  }
  return null;
};

const recordMovement = async ({ item, type, qtyBefore, qtyAfter, reason, createdBy }) => {
  try {
    const change = Math.round((Number(qtyAfter || 0) - Number(qtyBefore || 0)) * 100) / 100;
    if (change === 0 && type !== 'deleted') return;
    await InventoryMovement.create({
      item: item._id || item,
      itemName: item.itemName || item.name || 'Unknown item',
      type,
      qtyBefore: Number(qtyBefore || 0),
      qtyAfter: Number(qtyAfter || 0),
      change,
      reason: reason || '',
      createdBy: createdBy || 'System'
    });
  } catch (error) {
    console.error('Failed to record movement:', error.message);
  }
};

const movementType = (qtyBefore, qtyAfter) => {
  if (qtyAfter > qtyBefore) return 'stock_in';
  if (qtyAfter < qtyBefore) return 'stock_out';
  return 'adjustment';
};

router.get('/', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }
    const items = await Inventory.find(query).sort({ category: 1, name: 1 });
    res.json(apiResponse(true, '', items));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch inventory'));
  }
});

router.get('/movements', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { period, itemId } = req.query;
    const query = {};
    if (period) {
      const start = getPeriodStart(period);
      if (start) query.createdAt = { $gte: start };
    }
    if (itemId) query.item = itemId;
    const movements = await InventoryMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(req.query.limit) || 500, 1000));
    res.json(apiResponse(true, '', movements));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch movements'));
  }
});

router.get('/report', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { period } = req.query;
    const start = getPeriodStart(period);
    const query = start ? { createdAt: { $gte: start } } : {};
    const [movements, items] = await Promise.all([
      InventoryMovement.find(query).sort({ createdAt: 1 }),
      Inventory.find({ isActive: true }).sort({ category: 1, name: 1 })
    ]);

    const addedUnits = movements
      .filter((m) => m.change > 0)
      .reduce((sum, m) => sum + m.change, 0);
    const consumedUnits = Math.abs(
      movements.filter((m) => m.change < 0).reduce((sum, m) => sum + m.change, 0)
    );
    const netChange = Math.round((addedUnits - consumedUnits) * 100) / 100;

    const byCategory = items.reduce((acc, item) => {
      const existing = acc.find((c) => c.name === item.category);
      const value = (item.quantity || 0) * (item.pricePerUnit || 0);
      if (existing) {
        existing.count += 1;
        existing.units += item.quantity || 0;
        existing.value += value;
      } else {
        acc.push({ name: item.category, count: 1, units: item.quantity || 0, value });
      }
      return acc;
    }, []);

    res.json(apiResponse(true, '', {
      period,
      snapshot: {
        itemCount: items.length,
        totalUnits: items.reduce((s, i) => s + (i.quantity || 0), 0),
        totalValue: Math.round(items.reduce((s, i) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0) * 100) / 100,
        lowStockCount: items.filter((i) => i.quantity <= i.minStockLevel).length,
        byCategory
      },
      movements: {
        count: movements.length,
        addedUnits: Math.round(addedUnits * 100) / 100,
        consumedUnits: Math.round(consumedUnits * 100) / 100,
        netChange
      },
      added: movements.filter((m) => m.change > 0),
      consumed: movements.filter((m) => m.change < 0)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to generate inventory report'));
  }
});

router.get('/:id', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    res.json(apiResponse(true, '', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch item'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    await recordMovement({
      item: { _id: item._id, name: item.name },
      type: 'created',
      qtyBefore: 0,
      qtyAfter: item.quantity,
      reason: 'Item created',
      createdBy: req.user?.name || req.user?.email
    });
    res.status(201).json(apiResponse(true, 'Item created', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create item'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const existing = await Inventory.findById(req.params.id);
    if (!existing) return res.status(404).json(apiResponse(false, 'Item not found'));
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await recordMovement({
      item: { _id: item._id, name: item.name },
      type: movementType(existing.quantity, item.quantity),
      qtyBefore: existing.quantity,
      qtyAfter: item.quantity,
      reason: 'Item updated',
      createdBy: req.user?.name || req.user?.email
    });
    res.json(apiResponse(true, 'Item updated', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update item'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    await recordMovement({
      item: { _id: item._id, name: item.name },
      type: 'deleted',
      qtyBefore: item.quantity,
      qtyAfter: 0,
      reason: 'Item removed',
      createdBy: req.user?.name || req.user?.email
    });
    res.json(apiResponse(true, 'Item deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete item'));
  }
});

router.put('/:id/stock', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    const newQty = Math.max(0, Number(quantity));
    const oldQty = item.quantity;
    item.quantity = newQty;
    await item.save();
    await recordMovement({
      item: { _id: item._id, name: item.name },
      type: movementType(oldQty, newQty),
      qtyBefore: oldQty,
      qtyAfter: newQty,
      reason: reason || 'Stock adjustment',
      createdBy: req.user?.name || req.user?.email
    });
    res.json(apiResponse(true, 'Stock updated', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update stock'));
  }
});

export default router;