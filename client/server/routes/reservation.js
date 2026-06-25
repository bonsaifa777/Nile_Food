import express from 'express';
import Reservation from '../models/Reservation.js';
import { apiResponse } from '../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../shared/constants.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', upload.single('paymentProof'), async (req, res) => {
    try {
      const { 
        name, email, phone, date, time, guests, notes, 
        paymentMethod, reservationId, paymentReference, selectedBank
      } = req.body;

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
        status: finalStatus,
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
      paymentMethod, paymentReference
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
