import mongoose from 'mongoose';

const filterOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 }
});

const filterGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  options: [filterOptionSchema],
  order: { type: Number, default: 0 },
  showInMenu: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

filterGroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('FilterGroup', filterGroupSchema);
