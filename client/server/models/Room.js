import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: String, required: true, enum: ['single', 'double', 'suite', 'penthouse', 'deluxe', 'presidential'] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ src: String, alt: String, label: String }],
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 2 },
  amenities: [String],
  status: { type: String, enum: ['available', 'maintenance', 'unavailable'], default: 'available' },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

roomSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

export default mongoose.model('Room', roomSchema);
