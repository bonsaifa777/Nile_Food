import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

listingSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

listingSchema.index({ type: 1, order: 1 });

export default mongoose.model('Listing', listingSchema);
