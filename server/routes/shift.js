import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Shift from '../models/Shift.js';
import EmployeeSchedule from '../models/EmployeeSchedule.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { STAFF_ROLES } from '../shared/constants.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();

const ADMIN = ['admin', 'super_admin'];

router.get('/', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const shifts = await Shift.find({ isActive: true }).sort({ startTime: 1 });
    res.json(apiResponse(true, 'Shifts retrieved', shifts));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { name, type, startTime, endTime, gracePeriodMinutes, breakDurationMinutes, description, color } = req.body;
    const shift = await Shift.create({
      name, type, startTime, endTime, gracePeriodMinutes, breakDurationMinutes, description, color,
      createdBy: req.user.id
    });
    res.status(201).json(apiResponse(true, 'Shift created', shift));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/:id', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shift) return res.status(404).json(apiResponse(false, 'Shift not found'));
    res.json(apiResponse(true, 'Shift updated', shift));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.delete('/:id', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!shift) return res.status(404).json(apiResponse(false, 'Shift not found'));
    res.json(apiResponse(true, 'Shift deactivated'));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/assign', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { userId, shiftId, date, weekStart, notes } = req.body;
    if (!userId || !shiftId || !date) {
      return res.status(400).json(apiResponse(false, 'userId, shiftId, and date are required'));
    }
    const existing = await EmployeeSchedule.findOne({ user: userId, date });
    if (existing) {
      existing.shift = shiftId;
      existing.assignedBy = req.user.id;
      existing.notes = notes || existing.notes;
      await existing.save();
      return res.json(apiResponse(true, 'Schedule updated', existing));
    }
    const schedule = await EmployeeSchedule.create({
      user: userId, shift: shiftId, date, weekStart: weekStart || date,
      assignedBy: req.user.id, notes
    });
    res.status(201).json(apiResponse(true, 'Shift assigned', schedule));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/assign-batch', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json(apiResponse(false, 'Assignments array is required'));
    }
    const results = [];
    for (const a of assignments) {
      const { userId, shiftId, date, weekStart } = a;
      if (!userId || !shiftId || !date) continue;
      const existing = await EmployeeSchedule.findOne({ user: userId, date });
      if (existing) {
        existing.shift = shiftId;
        existing.assignedBy = req.user.id;
        await existing.save();
        results.push(existing);
      } else {
        const s = await EmployeeSchedule.create({
          user: userId, shift: shiftId, date, weekStart: weekStart || date,
          assignedBy: req.user.id
        });
        results.push(s);
      }
    }
    res.json(apiResponse(true, `${results.length} schedules created/updated`, results));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/schedule', authenticate, authorize(...STAFF_ROLES), async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    const query = {};
    if (userId && ['admin', 'super_admin'].includes(req.user.role)) {
      query.user = userId;
    } else {
      query.user = req.user.id;
    }
    if (start && end) {
      query.date = { $gte: start, $lte: end };
    }
    const schedules = await EmployeeSchedule.find(query)
      .sort({ date: 1 })
      .populate('shift', 'name type startTime endTime color')
      .populate('user', 'name email role avatar');
    res.json(apiResponse(true, 'Schedules retrieved', schedules));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.delete('/schedule/:id', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    await EmployeeSchedule.findByIdAndDelete(req.params.id);
    res.json(apiResponse(true, 'Schedule removed'));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/compliance', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const schedules = await EmployeeSchedule.find({ date: targetDate })
      .populate('shift', 'name startTime endTime')
      .populate('user', 'name email role avatar');
    const attendances = await Attendance.find({ date: targetDate });
    const results = schedules.map(s => {
      const att = attendances.find(a => String(a.user) === String(s.user._id));
      return {
        user: s.user,
        shift: s.shift,
        date: targetDate,
        clockedIn: !!att?.clockIn,
        clockedOut: !!att?.clockOut,
        onTime: att ? !att.isLate : false,
        lateMinutes: att?.lateMinutes || 0,
        totalHours: att?.totalHours || 0,
        status: att?.status || 'absent'
      };
    });
    res.json(apiResponse(true, 'Compliance data retrieved', results));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
