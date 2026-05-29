import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Other' },
  unit: { type: String, default: 'pcs' },
  quantity: { type: Number, default: 0, min: 0 },
  minStockLevel: { type: Number, default: 10 },
  pricePerUnit: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

inventorySchema.pre('save', function() {
  this.updatedAt = Date.now();
});

inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1 });

export default mongoose.model('Inventory', inventorySchema);
