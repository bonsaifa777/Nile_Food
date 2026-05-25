import express from 'express';
import Category from '../models/Category.js';
import { apiResponse } from '../../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../../shared/constants.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json(apiResponse(true, '', categories));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch categories'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json(apiResponse(false, 'Category not found'));
    }
    res.json(apiResponse(true, '', category));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch category'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(apiResponse(true, 'Category created', category));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create category'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json(apiResponse(false, 'Category not found'));
    }
    res.json(apiResponse(true, 'Category updated', category));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update category'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) {
      return res.status(404).json(apiResponse(false, 'Category not found'));
    }
    res.json(apiResponse(true, 'Category deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete category'));
  }
});

export default router;