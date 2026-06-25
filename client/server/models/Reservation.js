import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'expired'], default: 'pending' },
  paymentMethod: { type: String, enum: ['pay_hotel', 'bank', 'telebirr', 'chapa', 'stripe', 'paypal', ''], default: '' },
  paymentProof: { type: String, default: '' },
  paymentProofName: { type: String, default: '' },
  paymentReference: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  selectedBank: { type: String, default: '' },
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reservationSchema.index({ status: 1 });
reservationSchema.index({ email: 1 });

export default mongoose.model('Reservation', reservationSchema);
