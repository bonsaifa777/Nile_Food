import express from 'express';
import Food from '../models/Food.js';
import Order from '../models/Order.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const foods = await Food.find(query)
      .populate('category', 'name color')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Food.countDocuments(query);
    res.json(apiResponse(true, '', { foods, total, page: parseInt(page), limit: parseInt(limit) }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch foods'));
  }
});

router.get('/most-ordered', async (req, res) => {
  try {
    const LIMIT = parseInt(req.query.limit) || 8;
    const mostOrdered = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.food',
          name: { $first: '$items.name' },
          orderCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: LIMIT },
      {
        $lookup: {
          from: 'foods',
          localField: '_id',
          foreignField: '_id',
          as: 'food'
        }
      },
      { $unwind: '$food' },
      { $match: { 'food.isActive': true } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$food',
              { orderCount: '$orderCount' }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { orderCount: -1 } }
    ]);
    res.json(apiResponse(true, '', mostOrdered));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch most ordered'));
  }
});

router.get('/featured', async (req, res) => {
  try {
    const foods = await Food.find({ isActive: true, featured: true })
      .populate('category', 'name color')
      .limit(10);
    res.json(apiResponse(true, '', foods));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch featured'));
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json(apiResponse(false, 'Food not found'));
    const similar = await Food.find({
      _id: { $ne: food._id },
      category: food.category,
      isActive: true
    })
      .populate('category', 'name color')
      .limit(6);
    res.json(apiResponse(true, '', similar));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch similar foods'));
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json(apiResponse(true, '', []));
    const foods = await Food.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('category', 'name color')
      .limit(10);
    res.json(apiResponse(true, '', foods));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Search failed'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name color');
    if (!food) {
      return res.status(404).json(apiResponse(false, 'Food not found'));
    }
    res.json(apiResponse(true, '', food));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch food'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json(apiResponse(true, 'Food created', food));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create food'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!food) {
      return res.status(404).json(apiResponse(false, 'Food not found'));
    }
    res.json(apiResponse(true, 'Food updated', food));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update food'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!food) {
      return res.status(404).json(apiResponse(false, 'Food not found'));
    }
    res.json(apiResponse(true, 'Food deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete food'));
  }
});

export default router;