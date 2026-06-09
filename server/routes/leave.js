import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { STAFF_ROLES, LEAVE_STATUS, ATTENDANCE_SOCKET_EVENTS } from '../shared/constants.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();

const ADMIN = ['admin', 'super_admin'];

router.get('/', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { status, start, end, page = 1, limit = 20 } = req.query;
    const query = {};
    if (!ADMIN.includes(req.user.role)) {
      query.user = req.user.id;
    }
    if (status) query.status = status;
    if (start && end) {
      query.startDate = { $gte: new Date(start) };
      query.endDate = { $lte: new Date(end) };
    }
    const total = await LeaveRequest.countDocuments(query);
    const leaves = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email role avatar')
      .populate('approvedBy', 'name email');
    res.json(apiResponse(true, 'Leave requests retrieved', {
      leaves, total, page: parseInt(page), pages: Math.ceil(total / limit)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { type, startDate, endDate, reason, notes } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json(apiResponse(false, 'type, startDate, endDate, and reason are required'));
    }
    const leave = await LeaveRequest.create({
      user: req.user.id, type, startDate, endDate, reason, notes
    });

    if (req.io) {
      const user = await User.findById(req.user.id).select('name role');
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.LEAVE_UPDATE, {
        action: 'submitted',
        leave,
        userName: user.name,
        userId: req.user.id
      });
    }

    res.status(201).json(apiResponse(true, 'Leave request submitted', leave));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/:id/approve', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json(apiResponse(false, 'Leave request not found'));
    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json(apiResponse(false, 'Leave request is already ' + leave.status));
    }
    leave.status = LEAVE_STATUS.APPROVED;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    if (req.io) {
      const user = await User.findById(leave.user).select('name');
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.LEAVE_UPDATE, {
        action: 'approved',
        leave,
        userId: leave.user,
        userName: user?.name
      });
    }

    res.json(apiResponse(true, 'Leave request approved', leave));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/:id/reject', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json(apiResponse(false, 'Leave request not found'));
    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json(apiResponse(false, 'Leave request is already ' + leave.status));
    }
    leave.status = LEAVE_STATUS.REJECTED;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    leave.rejectionReason = rejectionReason;
    await leave.save();

    if (req.io) {
      const user = await User.findById(leave.user).select('name');
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.LEAVE_UPDATE, {
        action: 'rejected',
        leave,
        userId: leave.user,
        userName: user?.name
      });
    }

    res.json(apiResponse(true, 'Leave request rejected', leave));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/balance', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31);
    const leaves = await LeaveRequest.find({
      user: req.user.id,
      createdAt: { $gte: yearStart, $lte: yearEnd },
      status: LEAVE_STATUS.APPROVED
    });
    const totals = { sick: 0, annual: 0, emergency: 0, unpaid: 0 };
    leaves.forEach(l => {
      if (totals[l.type] !== undefined) totals[l.type] += l.totalDays || 0;
    });
    const remaining = {
      sick: Math.max(0, 12 - totals.sick),
      annual: Math.max(0, 20 - totals.annual),
      emergency: Math.max(0, 5 - totals.emergency),
      unpaid: Infinity
    };
    res.json(apiResponse(true, 'Leave balance retrieved', { used: totals, remaining }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
