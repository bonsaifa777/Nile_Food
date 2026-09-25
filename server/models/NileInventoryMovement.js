import mongoose from 'mongoose';

const nileInventoryMovementSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'NileInventory' },
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

nileInventoryMovementSchema.index({ item: 1 });
nileInventoryMovementSchema.index({ type: 1 });
nileInventoryMovementSchema.index({ createdAt: -1 });

export default mongoose.model('NileInventoryMovement', nileInventoryMovementSchema, 'nileinventorymovements');