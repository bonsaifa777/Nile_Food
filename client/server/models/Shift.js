import mongoose from 'mongoose';
import { SHIFT_TYPES } from '../shared/constants.js';

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(SHIFT_TYPES), default: SHIFT_TYPES.CUSTOM },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  gracePeriodMinutes: { type: Number, default: 15 },
  breakDurationMinutes: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  color: { type: String, default: '#6366f1' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export default mongoose.model('Shift', shiftSchema);
