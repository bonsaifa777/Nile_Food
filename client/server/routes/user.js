import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { apiResponse } from '../shared/utils.js';

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  res.json(apiResponse(true, '', req.user));
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true }
    ).select('-password');
    res.json(apiResponse(true, 'Profile updated', user));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update profile'));
  }
});

router.get('/addresses', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.json(apiResponse(true, '', user.addresses));
});

router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { label, address, city, latitude, longitude, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push({ label, address, city, latitude, longitude, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();
    res.json(apiResponse(true, 'Address added', user.addresses));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to add address'));
  }
});

router.put('/addresses/:id', authenticate, async (req, res) => {
  try {
    const { label, address, city, latitude, longitude, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    const addr = user.addresses.id(req.params.id);
    if (!addr) {
      return res.status(404).json(apiResponse(false, 'Address not found'));
    }
    Object.assign(addr, { label, address, city, latitude, longitude, isDefault });
    await user.save();
    res.json(apiResponse(true, 'Address updated', user.addresses));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update address'));
  }
});

router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.id);
    await user.save();
    res.json(apiResponse(true, 'Address deleted', user.addresses));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete address'));
  }
});

router.get('/favorites', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.json(apiResponse(true, '', user.favorites));
});

router.post('/favorites/:foodId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites.includes(req.params.foodId)) {
      user.favorites.push(req.params.foodId);
      await user.save();
    }
    res.json(apiResponse(true, 'Added to favorites', user.favorites));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to add favorite'));
  }
});

router.delete('/favorites/:foodId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(f => f.toString() !== req.params.foodId);
    await user.save();
    res.json(apiResponse(true, 'Removed from favorites', user.favorites));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to remove favorite'));
  }
});

export default router;