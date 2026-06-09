import express from 'express';
import ChatRoom from '../models/ChatRoom.js';
import ChatMessage from '../models/ChatMessage.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES, CHAT_CHANNELS, POS_SOCKET_EVENTS } from '../shared/constants.js';

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CASHIER, ROLES.KITCHEN_STAFF, ROLES.DELIVERY_DRIVER));

router.get('/channels', async (req, res) => {
  try {
    const role = req.user.role;
    let availableChannels = [];

    if (role === ROLES.CASHIER) {
      availableChannels = [
        CHAT_CHANNELS.CASHIER_KITCHEN,
        CHAT_CHANNELS.CASHIER_ADMIN,
        CHAT_CHANNELS.CUSTOMER_CASHIER
      ];
    } else if (role === ROLES.KITCHEN_STAFF) {
      availableChannels = [
        CHAT_CHANNELS.CASHIER_KITCHEN,
        CHAT_CHANNELS.ADMIN_KITCHEN
      ];
    } else if (role === ROLES.DELIVERY_DRIVER) {
      availableChannels = [
        CHAT_CHANNELS.ADMIN_DRIVER
      ];
    } else {
      availableChannels = Object.values(CHAT_CHANNELS);
    }

    const rooms = await ChatRoom.find({ channel: { $in: availableChannels }, isActive: true })
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    const channelLabels = {
      [CHAT_CHANNELS.CUSTOMER_CASHIER]: 'Customer Support',
      [CHAT_CHANNELS.CUSTOMER_ADMIN]: 'Customer Support',
      [CHAT_CHANNELS.CASHIER_KITCHEN]: 'Kitchen Chat',
      [CHAT_CHANNELS.ADMIN_KITCHEN]: 'Admin & Kitchen',
      [CHAT_CHANNELS.ADMIN_DRIVER]: 'Drivers Chat',
      [CHAT_CHANNELS.CASHIER_ADMIN]: 'Admin Chat'
    };

    const channelsWithInfo = availableChannels.map(channel => {
      const room = rooms.find(r => r.channel === channel);
      return {
        channel,
        label: channelLabels[channel] || channel,
        room: room || null,
        unread: 0
      };
    });

    res.json(apiResponse(true, '', channelsWithInfo));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch channels'));
  }
});

router.post('/rooms', async (req, res) => {
  try {
    const { channel, orderId } = req.body;
    if (!channel) return res.status(400).json(apiResponse(false, 'Channel is required'));

    let room = await ChatRoom.findOne({ channel, orderId: orderId || null, isActive: true });

    if (!room) {
      room = new ChatRoom({
        channel,
        name: channel,
        participants: [{ user: req.user._id, role: req.user.role }],
        orderId: orderId || null
      });
      await room.save();
    } else {
      const alreadyParticipant = room.participants.some(p => p.user.toString() === req.user._id.toString());
      if (!alreadyParticipant) {
        room.participants.push({ user: req.user._id, role: req.user.role });
        await room.save();
      }
    }

    res.json(apiResponse(true, '', room));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to get or create room'));
  }
});

router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json(apiResponse(false, 'Room not found'));

    const messages = await ChatMessage.find({ room: req.params.roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({ room: req.params.roomId });

    res.json(apiResponse(true, '', {
      messages: messages.reverse(),
      total,
      page: parseInt(page)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch messages'));
  }
});

router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { content, messageType } = req.body;
    if (!content) return res.status(400).json(apiResponse(false, 'Content is required'));

    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json(apiResponse(false, 'Room not found'));

    const message = new ChatMessage({
      room: req.params.roomId,
      sender: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      content,
      messageType: messageType || 'text',
      readBy: [{ user: req.user._id }]
    });

    await message.save();

    room.lastMessage = {
      content,
      sender: req.user._id,
      senderName: req.user.name,
      createdAt: new Date()
    };
    await room.save();

    const populated = await ChatMessage.findById(message._id)
      .populate('sender', 'name email');

    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.CHAT_MESSAGE, {
        room: req.params.roomId,
        channel: room.channel,
        message: populated
      });
    }

    res.status(201).json(apiResponse(true, 'Message sent', populated));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to send message'));
  }
});

router.put('/rooms/:roomId/read', async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { room: req.params.roomId, 'readBy.user': { $ne: req.user._id } },
      { $push: { readBy: { user: req.user._id } } }
    );
    res.json(apiResponse(true, 'Messages marked as read'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to mark messages as read'));
  }
});

router.post('/typing', async (req, res) => {
  try {
    const { roomId, channel } = req.body;
    if (req.io) {
      req.io.emit(POS_SOCKET_EVENTS.CHAT_TYPING, {
        roomId,
        channel,
        user: { name: req.user.name, role: req.user.role },
        typing: true
      });
    }
    res.json(apiResponse(true, ''));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed'));
  }
});

export default router;
