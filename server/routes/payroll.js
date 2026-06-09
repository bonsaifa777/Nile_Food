import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import PayrollSummary from '../models/PayrollSummary.js';
import User from '../models/User.js';
import { LEAVE_STATUS } from '../shared/constants.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();
const ADMIN = ['admin', 'super_admin'];

router.post('/calculate', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { userId, periodStart, periodEnd, hourlyRate, overtimeRate } = req.body;
    if (!userId || !periodStart || !periodEnd) {
      return res.status(400).json(apiResponse(false, 'userId, periodStart, and periodEnd are required'));
    }
    const rate = hourlyRate || 50;
    const otrate = overtimeRate || rate * 1.5;
    const start = new Date(periodStart).toISOString().split('T')[0];
    const end = new Date(periodEnd).toISOString().split('T')[0];

    const attendances = await Attendance.find({
      user: userId,
      date: { $gte: start, $lte: end }
    });

    const totalHoursWorked = attendances.reduce((s, a) => s + (a.totalHours || 0), 0);
    const overtimeHours = attendances.reduce((s, a) => s + (a.overtimeHours || 0), 0);
    const lateDays = attendances.filter(a => a.isLate).length;
    const absentDays = attendances.length === 0 ? 0 : attendances.filter(a => !a.clockIn).length;

    const leavesInPeriod = await LeaveRequest.find({
      user: userId,
      status: LEAVE_STATUS.APPROVED,
      startDate: { $lte: new Date(end) },
      endDate: { $gte: new Date(start) }
    });
    const leaveDays = leavesInPeriod.reduce((s, l) => s + (l.totalDays || 0), 0);

    const regularHoursPay = totalHoursWorked * rate;
    const overtimePay = overtimeHours * otrate;
    const totalPay = regularHoursPay + overtimePay;
    const latePenalties = lateDays * (rate * 0.5);
    const attendanceDeductions = absentDays * (rate * 8);
    const netPay = Math.max(0, totalPay - latePenalties - attendanceDeductions);

    const existing = await PayrollSummary.findOne({ user: userId, periodStart: start, periodEnd: end });
    if (existing) {
      existing.totalHoursWorked = totalHoursWorked;
      existing.overtimeHours = overtimeHours;
      existing.regularHoursPay = regularHoursPay;
      existing.overtimePay = overtimePay;
      existing.totalPay = totalPay;
      existing.latePenalties = latePenalties;
      existing.attendanceDeductions = attendanceDeductions;
      existing.lateDays = lateDays;
      existing.absentDays = absentDays;
      existing.leaveDays = leaveDays;
      existing.hourlyRate = rate;
      existing.overtimeRate = otrate;
      existing.netPay = netPay;
      existing.status = 'calculated';
      existing.calculatedBy = req.user.id;
      await existing.save();
      return res.json(apiResponse(true, 'Payroll updated', existing));
    }

    const payroll = await PayrollSummary.create({
      user: userId,
      periodStart: start,
      periodEnd: end,
      totalHoursWorked,
      overtimeHours,
      regularHoursPay,
      overtimePay,
      totalPay,
      latePenalties,
      attendanceDeductions,
      lateDays,
      absentDays,
      leaveDays,
      hourlyRate: rate,
      overtimeRate: otrate,
      netPay,
      status: 'calculated',
      calculatedBy: req.user.id
    });

    res.status(201).json(apiResponse(true, 'Payroll calculated', payroll));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { status, userId, start, end, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (start && end) {
      query.periodStart = { $gte: new Date(start) };
      query.periodEnd = { $lte: new Date(end) };
    }
    const total = await PayrollSummary.countDocuments(query);
    const payrolls = await PayrollSummary.find(query)
      .sort({ periodStart: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email role avatar')
      .populate('calculatedBy', 'name')
      .populate('approvedBy', 'name');
    res.json(apiResponse(true, 'Payroll records retrieved', {
      payrolls, total, page: parseInt(page), pages: Math.ceil(total / limit)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/:id/approve', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const payroll = await PayrollSummary.findByIdAndUpdate(req.params.id,
      { status: 'approved', approvedBy: req.user.id }, { new: true }
    );
    if (!payroll) return res.status(404).json(apiResponse(false, 'Payroll record not found'));
    res.json(apiResponse(true, 'Payroll approved', payroll));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/:id/pay', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const payroll = await PayrollSummary.findByIdAndUpdate(req.params.id,
      { status: 'paid', paidAt: new Date() }, { new: true }
    );
    if (!payroll) return res.status(404).json(apiResponse(false, 'Payroll record not found'));
    res.json(apiResponse(true, 'Payroll marked as paid', payroll));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/my-payroll', authenticate, authorize(...['admin', 'super_admin', 'kitchen_staff', 'delivery_driver', 'cashier', 'waiter']), async (req, res) => {
  try {
    const payrolls = await PayrollSummary.find({ user: req.user.id })
      .sort({ periodStart: -1 })
      .limit(12);
    res.json(apiResponse(true, 'Payroll history retrieved', payrolls));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
