import mongoose from 'mongoose';
import { CHAT_CHANNELS } from '../shared/constants.js';

const chatRoomSchema = new mongoose.Schema({
  channel: {
    type: String,
    enum: Object.values(CHAT_CHANNELS),
    required: true
  },
  name: { type: String },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    joinedAt: { type: Date, default: Date.now }
  }],
  orderId: { type: String },
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    createdAt: Date
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

chatRoomSchema.index({ channel: 1, isActive: 1 });
chatRoomSchema.index({ 'participants.user': 1 });

export default mongoose.model('ChatRoom', chatRoomSchema);
