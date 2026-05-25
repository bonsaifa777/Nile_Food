import mongoose from 'mongoose';
import { ROLES } from '../../shared/constants.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
  addresses: [{
    label: String,
    address: String,
    city: String,
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: false }
  }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  loyaltyPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);