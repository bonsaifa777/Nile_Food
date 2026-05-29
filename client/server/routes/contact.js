import express from 'express';
import mongoose from 'mongoose';
import ContactMessage from '../models/ContactMessage.js';
import User from '../models/User.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    let userRef = userId || undefined;
    if (!userRef && email) {
      const found = await User.findOne({ email });
      if (found) userRef = found._id;
    }
    if (userRef && req.user && String(userRef) === String(req.user._id)) {
      userRef = undefined;
    }
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      user: userRef,
    });
    await contactMessage.save();
    res.status(201).json(apiResponse(true, 'Message sent successfully', contactMessage));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to send message'));
  }
});

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', messages));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch messages'));
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const messages = await ContactMessage.find({
      $or: [
        { user: req.user._id },
        { email: req.user.email },
      ],
    })
      .sort({ createdAt: -1 });
    res.json(apiResponse(true, '', messages));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch messages'));
  }
});

router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.read !== undefined) updateFields.read = req.body.read;
    if (req.body.subject !== undefined) updateFields.subject = req.body.subject;
    if (req.body.message !== undefined) updateFields.message = req.body.message;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    if (!message) {
      return res.status(404).json(apiResponse(false, 'Message not found'));
    }
    res.json(apiResponse(true, 'Message updated', message));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update message'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json(apiResponse(false, 'Message not found'));
    }
    res.json(apiResponse(true, 'Message deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete message'));
  }
});

export default router;
