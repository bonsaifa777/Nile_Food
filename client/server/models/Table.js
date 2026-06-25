import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['regular', 'vip'],
    default: 'regular'
  },
  qrCode: { type: String },
  capacity: { type: Number, default: 4 },
  floor: { type: String, default: '1' },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'billing', 'cleaning', 'maintenance'], 
    default: 'available' 
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tableSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

export default mongoose.model('Table', tableSchema);