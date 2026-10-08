import express from 'express';
import Inventory from '../models/Inventory.js';
import InventoryMovement from '../models/InventoryMovement.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';
import {
  resolveReportRange,
  buildMovementQuery,
  buildStockSnapshot,
  summarizeMovements,
  priceMovements
} from '../shared/inventoryReport.js';

const router = express.Router();

const STAFF_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF];

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
    if (period || req.query.date || req.query.start || req.query.end) {
      const { start, end } = resolveReportRange(period, req.query);
      Object.assign(query, buildMovementQuery({ start, end }));
    }
    if (itemId) query.item = itemId;
    const limit = Math.min(Number(req.query.limit) || 500, 1000);
    const [movements, pricedItems] = await Promise.all([
      InventoryMovement.find(query).sort({ createdAt: -1 }).limit(limit),
      Inventory.find({}, 'pricePerUnit')
    ]);
    const priceByItem = new Map(pricedItems.map((i) => [String(i._id), i.pricePerUnit]));
    res.json(apiResponse(true, '', priceMovements(movements, priceByItem)));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch movements'));
  }
});

router.get('/report', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { period } = req.query;
    const { start, end, periodEnd, anchor, asOf, source } = resolveReportRange(period, req.query);

    const [movements, snapshot, pricedItems] = await Promise.all([
      InventoryMovement.find(buildMovementQuery({ start, end })).sort({ createdAt: 1 }),
      buildStockSnapshot({ Item: Inventory, Movement: InventoryMovement, asOf }),
      Inventory.find({}, 'pricePerUnit')
    ]);

    const priceByItem = new Map(pricedItems.map((i) => [String(i._id), i.pricePerUnit]));
    const stockMovements = movements.filter((m) => m.type !== 'deleted');
    const summary = summarizeMovements(movements, priceByItem);

    res.json(apiResponse(true, '', {
      period: period || 'day',
      range: { start, end, periodEnd, anchor, asOf, source },
      snapshot: {
        ...snapshot.totals,
        asOf,
        items: snapshot.rows
      },
      movements: summary,
      added: priceMovements(stockMovements.filter((m) => m.change > 0), priceByItem),
      consumed: priceMovements(stockMovements.filter((m) => m.change < 0), priceByItem)
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