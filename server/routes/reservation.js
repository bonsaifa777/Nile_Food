import express from 'express';
import Reservation from '../models/Reservation.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';
import upload from '../middleware/upload.js';
import mongoose from 'mongoose';

const router = express.Router();
const LOCK_DURATION_MINUTES = 10;

router.get('/confirmed', async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      status: 'confirmed', 
      paymentMethod: { $in: ['telebirr', 'bank'] }, 
      roomId: { $ne: null } 
    }).sort({ createdAt: -1 });
    res.json(apiResponse(true, '', reservations));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch reservations'));
  }
});

router.get('/availability/check', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, reservationId } = req.query;
    
    if (!roomId) {
      return res.status(400).json(apiResponse(false, 'roomId is required'));
    }
    
    if (!checkIn) {
      return res.status(400).json(apiResponse(false, 'checkIn date is required'));
    }

    const result = await Reservation.checkAvailability(roomId, checkIn, checkOut, reservationId);
    
    res.json(apiResponse(true, result.message, result));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to check availability'));
  }
});

router.get('/availability/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const bookedDates = await Reservation.getRoomBookedDates(roomId);
    
    res.json(apiResponse(true, '', { 
      roomId, 
      bookedDates,
      totalBookedDays: bookedDates.length
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to check room availability'));
  }
});

router.post('/lock', authenticate, async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;
    
    if (!roomId || !checkIn) {
      return res.status(400).json(apiResponse(false, 'roomId and checkIn are required'));
    }

    const availability = await Reservation.checkAvailability(roomId, checkIn, checkOut);
    
    if (!availability.available) {
      return res.status(409).json(apiResponse(false, 'Room is not available for these dates', availability));
    }

    const existingActiveLocks = await Reservation.find({
      roomId: new mongoose.Types.ObjectId(roomId),
      lockExpiresAt: { $gt: new Date() },
      lockedBy: req.user.email,
      status: 'pending'
    });

    if (existingActiveLocks.length > 0) {
      return res.json(apiResponse(true, 'You already have an active lock for this room', {
        lock: existingActiveLocks[0],
        lockExpiresAt: existingActiveLocks[0].lockExpiresAt
      }));
    }

    const lockExpiresAt = new Date();
    lockExpiresAt.setMinutes(lockExpiresAt.getMinutes() + LOCK_DURATION_MINUTES);

    const lockReservation = new Reservation({
      name: req.user.name || 'Locked Booking',
      email: req.user.email,
      phone: req.user.phone || '',
      date: checkIn,
      time: '19:00',
      guests: guests || 1,
      status: 'pending',
      roomId: roomId,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      lockExpiresAt,
      lockedBy: req.user.email
    });

    await lockReservation.save();

    res.json(apiResponse(true, `Room locked for ${LOCK_DURATION_MINUTES} minutes`, {
      reservationId: lockReservation._id,
      lockExpiresAt,
      lockDurationMinutes: LOCK_DURATION_MINUTES,
      message: 'Complete your booking before the lock expires'
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to lock room'));
  }
});

 router.post('/', upload.single('paymentProof'), async (req, res) => {
   try {
     const { 
       name, email, phone, date, time, guests, notes, 
       paymentMethod, roomName, roomId,
       checkIn, checkOut, totalPrice, pricePerNight, nights,
       reservationId, paymentReference, selectedBank
     } = req.body;
     
     if (roomId) {
       const ci = checkIn || date;
       const availability = await Reservation.checkAvailability(roomId, ci, checkOut, reservationId);
       
       if (!availability.available) {
         return res.status(409).json(apiResponse(
           false, 
           'Room is not available for the selected dates. Please choose different dates.',
           availability
         ));
       }
     }

     const paymentProof = req.file ? `/uploads/payment-proofs/${req.file.filename}` : '';
     const paymentProofName = req.file ? req.file.originalname : '';

     let finalStatus = 'pending';
     if (paymentMethod === 'telebirr' || paymentMethod === 'bank') {
       if (paymentProof || paymentReference) {
         finalStatus = 'confirmed';
       }
     } else if (paymentMethod === 'pay_hotel' || !paymentMethod) {
       finalStatus = 'confirmed';
     }

     const reservationData = {
       name, email, phone, date, time, guests, notes,
       paymentMethod: paymentMethod || 'pay_hotel',
       paymentProof,
       paymentProofName,
       paymentReference: paymentReference || '',
       paymentStatus: paymentProof || paymentReference ? 'paid' : 'pending',
       selectedBank: selectedBank || '',
       roomName: roomName || '',
       roomId: roomId || null,
       checkIn: checkIn ? new Date(checkIn) : null,
       checkOut: checkOut ? new Date(checkOut) : null,
       totalPrice: totalPrice ? Number(totalPrice) : null,
       pricePerNight: pricePerNight ? Number(pricePerNight) : null,
       nights: nights ? Number(nights) : null,
       status: finalStatus,
       lockExpiresAt: null,
       lockedBy: '',
       updatedAt: new Date()
     };

    let reservation;
    if (reservationId) {
      reservation = await Reservation.findByIdAndUpdate(
        reservationId,
        reservationData,
        { new: true }
      );
      if (!reservation) {
        return res.status(404).json(apiResponse(false, 'Reservation not found'));
      }
    } else {
      reservation = new Reservation(reservationData);
      await reservation.save();
    }

    res.status(201).json(apiResponse(
      true, 
      finalStatus === 'confirmed' ? 'Reservation confirmed successfully!' : 'Reservation submitted successfully',
      reservation
    ));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to process reservation'));
  }
});

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.roomId) filter.roomId = req.query.roomId;
    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(apiResponse(true, '', reservations));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch reservations'));
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json(apiResponse(false, 'Reservation not found'));
    }

    const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN;
    const isOwner = reservation.email === req.user.email;

    if (!isAdmin && !isOwner) {
      return res.status(403).json(apiResponse(false, 'Not authorized'));
    }

    res.json(apiResponse(true, '', reservation));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch reservation'));
  }
});

router.put('/:id', authenticate, upload.single('paymentProof'), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json(apiResponse(false, 'Reservation not found'));
    }

    const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPER_ADMIN;
    const isOwner = reservation.email === req.user.email;

    if (!isAdmin && !isOwner) {
      return res.status(403).json(apiResponse(false, 'Not authorized'));
    }

    const { 
      status, name, email, date, time, guests, notes, 
      paymentMethod, roomName, roomId,
      checkIn, checkOut, totalPrice, pricePerNight, nights,
      paymentReference
    } = req.body;
    const update = { updatedAt: new Date() };

    if (isAdmin) {
      if (status) update.status = status;
      if (name) update.name = name;
      if (email) update.email = email;
      if (date) update.date = date;
      if (time) update.time = time;
      if (guests) update.guests = guests;
      if (notes !== undefined) update.notes = notes;
      if (paymentMethod !== undefined) update.paymentMethod = paymentMethod;
      if (roomName !== undefined) update.roomName = roomName;
      if (roomId !== undefined) update.roomId = roomId;
      if (checkIn !== undefined) update.checkIn = checkIn ? new Date(checkIn) : null;
      if (checkOut !== undefined) update.checkOut = checkOut ? new Date(checkOut) : null;
      if (totalPrice !== undefined) update.totalPrice = totalPrice ? Number(totalPrice) : null;
      if (pricePerNight !== undefined) update.pricePerNight = pricePerNight ? Number(pricePerNight) : null;
      if (nights !== undefined) update.nights = nights ? Number(nights) : null;
      if (paymentReference !== undefined) update.paymentReference = paymentReference;
    } else if (isOwner) {
      if (status === 'cancelled') update.status = 'cancelled';
      if (notes !== undefined) update.notes = notes;
    }

    if (req.file) {
      update.paymentProof = `/uploads/payment-proofs/${req.file.filename}`;
      update.paymentProofName = req.file.originalname;
      update.paymentStatus = 'paid';
    }

    if (roomId && (checkIn || date)) {
      const ci = checkIn || date;
      const availability = await Reservation.checkAvailability(roomId, ci, checkOut, req.params.id);
      
      if (!availability.available) {
        return res.status(409).json(apiResponse(
          false,
          'Room is not available for the selected dates',
          availability
        ));
      }
    }

    const updated = await Reservation.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(apiResponse(true, 'Reservation updated', updated));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update reservation'));
  }
});

router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json(apiResponse(false, 'Reservation not found'));
    }
    res.json(apiResponse(true, 'Reservation deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete reservation'));
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(apiResponse(true, '', reservations));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch reservations'));
  }
});

export default router;
