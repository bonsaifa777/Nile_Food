import express from 'express';
import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken, apiResponse } from '../shared/utils.js';
import { ROLES } from '../shared/constants.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(apiResponse(false, 'Email already registered'));
    }
    const hashedPassword = await hashPassword(password);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();
    const token = generateToken(user);
    res.status(201).json(apiResponse(true, 'Registration successful', { user, token }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Registration failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(apiResponse(false, 'Invalid credentials'));
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json(apiResponse(false, 'Invalid credentials'));
    }
    const token = generateToken(user);
    res.json(apiResponse(true, 'Login successful', { user, token }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Login failed'));
  }
});

router.get('/me', authenticate, async (req, res) => {
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
    res.status(500).json(apiResponse(false, 'Profile update failed'));
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json(apiResponse(false, 'Current password is incorrect'));
    }
    user.password = await hashPassword(newPassword);
    await user.save();
    res.json(apiResponse(true, 'Password updated successfully'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Password update failed'));
  }
});

export default router;