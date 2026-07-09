import express from 'express';
import FilterGroup from '../models/FilterGroup.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filterGroups = await FilterGroup.find({ isActive: true }).sort({ order: 1 });
    res.json(apiResponse(true, '', filterGroups));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch filter groups'));
  }
});

router.get('/:id', async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findById(req.params.id);
    if (!filterGroup) {
      return res.status(404).json(apiResponse(false, 'Filter group not found'));
    }
    res.json(apiResponse(true, '', filterGroup));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch filter group'));
  }
});

router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const filterGroup = new FilterGroup(req.body);
    await filterGroup.save();
    res.status(201).json(apiResponse(true, 'Filter group created', filterGroup));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create filter group'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!filterGroup) {
      return res.status(404).json(apiResponse(false, 'Filter group not found'));
    }
    res.json(apiResponse(true, 'Filter group updated', filterGroup));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update filter group'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const filterGroup = await FilterGroup.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!filterGroup) {
      return res.status(404).json(apiResponse(false, 'Filter group not found'));
    }
    res.json(apiResponse(true, 'Filter group deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete filter group'));
  }
});

export default router;
