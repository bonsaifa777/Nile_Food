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
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  roomName: { type: String, default: '' },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  totalPrice: { type: Number, default: null },
  pricePerNight: { type: Number, default: null },
  nights: { type: Number, default: null },
  lockExpiresAt: { type: Date, default: null },
  lockedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reservationSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });
reservationSchema.index({ roomId: 1, date: 1, time: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ lockExpiresAt: 1 });
reservationSchema.index({ email: 1 });

reservationSchema.statics.checkAvailability = async function(roomId, checkIn, checkOut, excludeReservationId = null) {
  if (!roomId) return { available: true, conflicts: [] };

  const isDateRange = checkIn && checkOut;
  
  const baseFilter = {
    roomId: new mongoose.Types.ObjectId(roomId),
    status: { $in: ['pending', 'confirmed'] },
    _id: { $ne: excludeReservationId ? new mongoose.Types.ObjectId(excludeReservationId) : null }
  };

  let dateFilter = {};
  
  if (isDateRange) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    dateFilter = {
      $and: [
        { checkIn: { $lt: checkOutDate } },
        { checkOut: { $gt: checkInDate } }
      ]
    };
  } else if (checkIn) {
    const singleDate = new Date(checkIn);
    singleDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(singleDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    dateFilter = {
      $or: [
        { checkIn: { $lt: nextDay, $gte: singleDate } },
        { checkOut: { $gt: singleDate, $lte: nextDay } },
        { date: checkIn instanceof Date ? checkIn.toISOString().split('T')[0] : String(checkIn) }
      ]
    };
  }

  const conflicts = await this.find({
    ...baseFilter,
    ...dateFilter
  }).select('name checkIn checkOut date time status');

  return {
    available: conflicts.length === 0,
    conflicts: conflicts,
    message: conflicts.length > 0 ? `Room is already booked for ${conflicts.length} overlapping reservation(s)` : 'Room is available'
  };
};

reservationSchema.statics.getRoomBookedDates = async function(roomId) {
  if (!roomId) return [];

  const bookings = await this.find({
    roomId: new mongoose.Types.ObjectId(roomId),
    status: { $in: ['pending', 'confirmed'] }
  }).select('checkIn checkOut date time status');

  const bookedDates = new Set();
  
  bookings.forEach(booking => {
    if (booking.checkIn && booking.checkOut) {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        bookedDates.add(d.toISOString().split('T')[0]);
      }
    } else if (booking.date) {
      bookedDates.add(booking.date);
    }
  });

  return Array.from(bookedDates).sort();
};

export default mongoose.model('Reservation', reservationSchema);
