import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String },
  senderName: { type: String },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

chatMessageSchema.index({ room: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
