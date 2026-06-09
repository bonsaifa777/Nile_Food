import mongoose from 'mongoose';

const dailyQRCodeSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true },
  qrDataURL: { type: String },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

dailyQRCodeSchema.index({ code: 1 });
dailyQRCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('DailyQRCode', dailyQRCodeSchema);
