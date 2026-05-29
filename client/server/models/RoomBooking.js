import mongoose from 'mongoose';

const roomBookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestPhone: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  roomName: { type: String },
  roomNumber: { type: String },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  pricePerNight: { type: Number },
  nights: { type: Number },
  guests: { type: Number, required: true },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['', 'telebirr', 'bank', 'pay_hotel', 'chapa', 'stripe', 'paypal'],
    default: ''
  },
  paymentReference: { type: String, default: '' },
  lockExpiresAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

roomBookingSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

roomBookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
roomBookingSchema.index({ bookingStatus: 1 });
roomBookingSchema.index({ lockExpiresAt: 1 });

export default mongoose.model('RoomBooking', roomBookingSchema);
