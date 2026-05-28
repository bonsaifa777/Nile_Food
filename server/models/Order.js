import mongoose from 'mongoose';
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_STATUS, PAYMENT_METHOD } from '../shared/constants.js';

const orderItemSchema = new mongoose.Schema({
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  size: { type: String },
  extras: [{
    name: { type: String },
    price: { type: Number }
  }],
  specialInstructions: { type: String },
  removedIngredients: [{ type: String }]
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String },
  guestPhone: { type: String },
  items: [orderItemSchema],
  type: { type: String, enum: Object.values(ORDER_TYPE), default: ORDER_TYPE.DELIVERY },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), default: PAYMENT_METHOD.CASH },
  paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
  paymentReference: { type: String },
  deliveryAddress: {
    label: String,
    address: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  deliveryNotes: { type: String },
  deliveryDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedDeliveryTime: { type: Number },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  rating: { type: Number },
  review: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);