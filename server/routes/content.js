import express from 'express';
import Content from '../models/Content.js';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';
import { apiResponse } from '../../shared/utils.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../../shared/constants.js';

const router = express.Router();

router.get('/content/:key', async (req, res) => {
  try {
    const content = await Content.findOne({ key: req.params.key });
    res.json(apiResponse(true, '', content));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch content'));
  }
});

router.put('/content/:key', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value },
      { new: true, upsert: true }
    );
    res.json(apiResponse(true, 'Content updated', content));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update content'));
  }
});

router.get('/listings/:type', async (req, res) => {
  try {
    const filter = { type: req.params.type };
    if (req.query.all !== 'true') {
      filter.isActive = true;
    }
    const listings = await Listing.find(filter)
      .sort({ order: 1 })
      .select('-__v');
    res.json(apiResponse(true, '', listings));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch listings'));
  }
});

router.post('/listings/:type', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const listing = new Listing({ type: req.params.type, ...req.body });
    await listing.save();
    res.status(201).json(apiResponse(true, 'Listing created', listing));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to create listing'));
  }
});

router.put('/listings/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!listing) {
      return res.status(404).json(apiResponse(false, 'Listing not found'));
    }
    res.json(apiResponse(true, 'Listing updated', listing));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to update listing'));
  }
});

router.delete('/listings/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!listing) {
      return res.status(404).json(apiResponse(false, 'Listing not found'));
    }
    res.json(apiResponse(true, 'Listing deleted'));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to delete listing'));
  }
});

// ─── Real Customer Reviews (from orders) ──────────────────────
router.get('/listings/testimonial/real', async (req, res) => {
  try {
    const orders = await Order.find({
      review: { $exists: true, $ne: '', $ne: null },
      rating: { $gte: 3 }
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const reviews = orders.map(o => ({
      _id: o._id,
      type: 'testimonial',
      data: {
        name: o.user?.name || o.guestName || 'Anonymous',
        role: 'Verified Customer',
        text: o.review,
        rating: o.rating || 5,
        initial: (o.user?.name || o.guestName || 'A').charAt(0).toUpperCase(),
      },
      order: 0,
      isActive: true,
      isRealReview: true,
      createdAt: o.createdAt,
    }));

    res.json(apiResponse(true, '', reviews));
  } catch (error) {
    res.status(500).json(apiResponse(false, 'Failed to fetch reviews'));
  }
});

export default router;
