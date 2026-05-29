import express from 'express';
import Inventory from '../models/Inventory.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF), async (req, res) => {
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

router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF), async (req, res) => {
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
    res.status(201).json(apiResponse(true, 'Item created', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create item'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    res.json(apiResponse(true, 'Item updated', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update item'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    res.json(apiResponse(true, 'Item deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete item'));
  }
});

router.put('/:id/stock', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF), async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json(apiResponse(false, 'Item not found'));
    item.quantity = Math.max(0, quantity);
    await item.save();
    res.json(apiResponse(true, 'Stock updated', item));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update stock'));
  }
});

export default router;
