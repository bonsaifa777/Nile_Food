import express from 'express';
import { apiResponse } from '../shared/utils.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const notifications = new Map();

router.get('/', authenticate, async (req, res) => {
  const userNotifications = notifications.get(req.user._id.toString()) || [];
  res.json(apiResponse(true, '', userNotifications));
});

router.put('/read/:id', authenticate, async (req, res) => {
  const userNotifications = notifications.get(req.user._id.toString()) || [];
  const notification = userNotifications.find(n => n._id.toString() === req.params.id);
  if (notification) {
    notification.read = true;
  }
  res.json(apiResponse(true, 'Marked as read'));
});

router.post('/send', authenticate, async (req, res) => {
  const { userId, title, message, type } = req.body;
  const notification = {
    _id: Date.now().toString(),
    title,
    message,
    type,
    read: false,
    createdAt: new Date()
  };
  const userNotifications = notifications.get(userId) || [];
  userNotifications.unshift(notification);
  notifications.set(userId, userNotifications);
  res.json(apiResponse(true, 'Notification sent'));
});

export default router;