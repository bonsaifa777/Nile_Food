import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  itemName: { type: String, required: true },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'adjustment', 'created', 'updated', 'deleted'],
    default: 'adjustment'
  },
  reason: { type: String, default: '' },
  qtyBefore: { type: Number, default: 0 },
  qtyAfter: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  createdBy: { type: String, default: 'System' },
  createdAt: { type: Date, default: Date.now }
});

inventoryMovementSchema.index({ item: 1 });
inventoryMovementSchema.index({ type: 1 });
inventoryMovementSchema.index({ createdAt: -1 });

export default mongoose.model('InventoryMovement', inventoryMovementSchema);