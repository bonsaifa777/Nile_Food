import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Nile Food' },
  email: { type: String, default: 'contact@nilefood.com' },
  phone: { type: String, default: '+251-XXX-XXX-XXX' },
  address: { type: String, default: 'Addis Ababa, Ethiopia' },
  deliveryFee: { type: Number, default: 50 },
  deliveryRadius: { type: Number, default: 10 },
  taxRate: { type: Number, default: 15 },
  currency: { type: String, default: 'ETB' },
  timezone: { type: String, default: 'Africa/Addis_Ababa' },
  paymentMethods: {
    cashOnDelivery: { type: Boolean, default: true },
    chapa: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: false }
  },
  chapaSecretKey: { type: String, default: '' },
  chapaPublicKey: { type: String, default: '' },
  estimatedDeliveryTime: { type: Number, default: 45 },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Settings', settingsSchema);
