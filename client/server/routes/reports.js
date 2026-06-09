import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();
const ADMIN = ['admin', 'super_admin'];

router.get('/daily', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: targetDate })
      .populate('user', 'name email role avatar')
      .populate('shift', 'name startTime endTime')
      .sort({ clockIn: -1 });
    const present = records.filter(r => r.clockIn).length;
    const late = records.filter(r => r.isLate).length;
    const absent = await User.countDocuments({ role: { $in: ['admin', 'super_admin', 'kitchen_staff', 'delivery_driver', 'cashier', 'waiter'] } }) - present;
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);
    res.json(apiResponse(true, 'Daily report', {
      date: targetDate, records, summary: { present, absent, late, totalHours, totalEmployees: records.length }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/weekly', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { start } = req.query;
    const weekStart = start || (() => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay() + 1);
      return d.toISOString().split('T')[0];
    })();
    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 86400000).toISOString().split('T')[0];
    const records = await Attendance.find({ date: { $gte: weekStart, $lte: weekEnd } })
      .populate('user', 'name email role avatar')
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1 });
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);
    const totalOvertime = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
    const byDay = {};
    for (const r of records) {
      if (!byDay[r.date]) byDay[r.date] = { date: r.date, records: [], totalHours: 0 };
      byDay[r.date].records.push(r);
      byDay[r.date].totalHours += r.totalHours || 0;
    }
    res.json(apiResponse(true, 'Weekly report', {
      weekStart, weekEnd, daily: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      summary: { totalHours, totalOvertime, totalRecords: records.length }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/monthly', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const monthStart = `${y}-${String(m).padStart(2, '0')}-01`;
    const monthEnd = new Date(y, m, 0).toISOString().split('T')[0];
    const records = await Attendance.find({ date: { $gte: monthStart, $lte: monthEnd } })
      .populate('user', 'name email role avatar')
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1 });
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);
    const totalOvertime = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
    const lateCount = records.filter(r => r.isLate).length;
    const byUser = {};
    for (const r of records) {
      const uid = String(r.user?._id || r.user);
      if (!byUser[uid]) {
        byUser[uid] = {
          user: r.user, records: [], totalHours: 0, totalOvertime: 0, lateDays: 0, presentDays: 0
        };
      }
      byUser[uid].records.push(r);
      byUser[uid].totalHours += r.totalHours || 0;
      byUser[uid].totalOvertime += r.overtimeHours || 0;
      if (r.isLate) byUser[uid].lateDays += 1;
      if (r.clockIn) byUser[uid].presentDays += 1;
    }
    res.json(apiResponse(true, 'Monthly report', {
      month: m, year: y, monthStart, monthEnd,
      employees: Object.values(byUser),
      summary: { totalHours, totalOvertime, lateCount, totalRecords: records.length }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/export/csv', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json(apiResponse(false, 'start and end dates required'));
    const records = await Attendance.find({ date: { $gte: start, $lte: end } })
      .populate('user', 'name email role')
      .populate('shift', 'name')
      .sort({ date: -1 })
      .lean();
    const headers = ['Employee Name', 'Email', 'Role', 'Date', 'Shift', 'Clock In', 'Clock Out',
      'Total Hours', 'Overtime Hours', 'Break Duration (min)', 'Late', 'Late Minutes',
      'Early Departure', 'Status'];
    const csvRows = [headers.join(',')];
    for (const r of records) {
      const row = [
        `"${r.user?.name || 'Unknown'}"`,
        `"${r.user?.email || ''}"`,
        `"${r.user?.role || ''}"`,
        r.date,
        `"${r.shift?.name || ''}"`,
        r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '',
        r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '',
        r.totalHours || 0,
        r.overtimeHours || 0,
        r.totalBreakDuration || 0,
        r.isLate ? 'Yes' : 'No',
        r.lateMinutes || 0,
        r.isEarlyDeparture ? 'Yes' : 'No',
        r.status || ''
      ];
      csvRows.push(row.join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${start}-to-${end}.csv`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
