import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../shared/constants.js';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  status: { type: String, enum: Object.values(ATTENDANCE_STATUS), default: ATTENDANCE_STATUS.CLOCKED_IN },
  clockIn: { type: Date },
  clockOut: { type: Date },
  breaks: [{
    start: { type: Date, required: true },
    end: { type: Date },
    duration: { type: Number, default: 0 }
  }],
  totalBreakDuration: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  isLate: { type: Boolean, default: false },
  lateMinutes: { type: Number, default: 0 },
  isEarlyDeparture: { type: Boolean, default: false },
  earlyDepartureMinutes: { type: Number, default: 0 },
  location: {
    clockIn: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number }
    },
    clockOut: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number }
    }
  },
  faceVerification: {
    clockIn: {
      timestamp: { type: Date },
      result: { type: String, enum: ['success', 'failed', 'skipped'] },
      confidence: { type: Number }
    },
    clockOut: {
      timestamp: { type: Date },
      result: { type: String, enum: ['success', 'failed', 'skipped'] },
      confidence: { type: Number }
    }
  },
  qrCode: { type: String },
  verificationMethod: { type: String, enum: ['none', 'qr', 'gps', 'face', 'gps+face', 'gps+qr'], default: 'none' },
  notes: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

attendanceSchema.methods.calculateTotalHours = function () {
  if (!this.clockIn || !this.clockOut) return 0;
  const total = (this.clockOut - this.clockIn) / (1000 * 60 * 60);
  return Math.max(0, parseFloat((total - this.totalBreakDuration / 60).toFixed(2)));
};

attendanceSchema.methods.calculateOvertime = function (scheduledHours = 8) {
  const worked = this.calculateTotalHours();
  return Math.max(0, parseFloat((worked - scheduledHours).toFixed(2)));
};

attendanceSchema.pre('save', function (next) {
  if (this.clockIn && this.clockOut) {
    this.totalHours = this.calculateTotalHours();
  }
  if (this.breaks && this.breaks.length > 0) {
    this.totalBreakDuration = this.breaks
      .filter(b => b.end)
      .reduce((sum, b) => sum + (b.duration || 0), 0);
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);
