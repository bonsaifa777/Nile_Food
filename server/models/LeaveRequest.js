import mongoose from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUS } from '../shared/constants.js';

const leaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: Object.values(LEAVE_TYPES), required: true },
  status: { type: String, enum: Object.values(LEAVE_STATUS), default: LEAVE_STATUS.PENDING },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  totalDays: { type: Number },
  isPaid: { type: Boolean, default: true }
}, {
  timestamps: true
});

leaveRequestSchema.index({ user: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

leaveRequestSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  if (this.type === 'unpaid') {
    this.isPaid = false;
  }
  next();
});

export default mongoose.model('LeaveRequest', leaveRequestSchema);
