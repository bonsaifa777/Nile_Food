import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import Shift from '../models/Shift.js';
import LeaveRequest from '../models/LeaveRequest.js';
import EmployeeSchedule from '../models/EmployeeSchedule.js';
import User from '../models/User.js';
import { ATTENDANCE_STATUS, LEAVE_STATUS } from '../shared/constants.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();
const ADMIN = ['admin', 'super_admin'];

router.get('/dashboard', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const staff = await User.find({ role: { $in: ['admin', 'super_admin', 'kitchen_staff', 'delivery_driver', 'cashier', 'waiter'] } }).select('name email role avatar');
    const attendances = await Attendance.find({ date: today }).populate('shift');
    const leaves = await LeaveRequest.find({ status: LEAVE_STATUS.APPROVED, startDate: { $lte: now }, endDate: { $gte: now } });

    const onLeaveIds = leaves.map(l => String(l.user));
    const activeStaff = staff.filter(s => !onLeaveIds.includes(String(s._id)));

    const present = attendances.filter(a => a.status === ATTENDANCE_STATUS.CLOCKED_IN || a.status === ATTENDANCE_STATUS.ON_BREAK);
    const onBreak = attendances.filter(a => a.status === ATTENDANCE_STATUS.ON_BREAK);
    const clockedIn = attendances.filter(a => a.clockIn);
    const clockedOut = attendances.filter(a => a.status === ATTENDANCE_STATUS.CLOCKED_OUT);
    const late = attendances.filter(a => a.isLate);
    const absent = activeStaff.filter(s => !attendances.find(a => String(a.user) === String(s._id)));
    const absentCount = absent.length;
    const currentlyWorking = present.filter(a => a.status === ATTENDANCE_STATUS.CLOCKED_IN);

    const schedulePromises = activeStaff.map(async (s) => {
      const schedule = await EmployeeSchedule.findOne({ user: s._id, date: today }).populate('shift');
      return schedule;
    });
    const schedules = await Promise.all(schedulePromises);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStr = (d) => d.toISOString().split('T')[0];

    const weekAttendance = await Attendance.find({
      date: { $gte: weekStr(weekStart), $lte: weekStr(weekEnd) }
    });

    const dailyChart = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const ds = weekStr(d);
      const dayAtt = weekAttendance.filter(a => a.date === ds);
      const dayPresent = dayAtt.filter(a => a.status !== ATTENDANCE_STATUS.CLOCKED_OUT || a.clockIn).length;
      const dayAbsent = activeStaff.length - dayPresent;
      const dayLate = dayAtt.filter(a => a.isLate).length;
      dailyChart.push({
        date: ds,
        day: d.toLocaleDateString('en', { weekday: 'short' }),
        present: dayPresent,
        absent: dayAbsent,
        late: dayLate,
        totalStaff: activeStaff.length
      });
    }

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthAttendance = await Attendance.find({
      date: { $gte: weekStr(monthStart), $lte: weekStr(monthEnd) }
    });
    const monthChart = [];
    const daysInMonth = monthEnd.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const ds = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayAtt = monthAttendance.filter(a => a.date === ds);
      const presentCount = dayAtt.filter(a => a.clockIn).length;
      monthChart.push({ date: ds, present: presentCount, absent: activeStaff.length - presentCount });
    }

    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const upcomingShifts = [];
    for (let i = 0; i < schedules.length; i++) {
      const s = schedules[i];
      if (s && s.shift) {
        upcomingShifts.push({
          user: activeStaff[i],
          shift: s.shift,
          date: today
        });
      }
    }

    const weeklyHours = await Attendance.aggregate([
      { $match: { date: { $gte: weekStr(weekStart), $lte: weekStr(weekEnd) } } },
      { $group: { _id: null, totalHours: { $sum: '$totalHours' }, totalOvertime: { $sum: '$overtimeHours' } } }
    ]);

    const employeeList = activeStaff.map(s => {
      const att = attendances.find(a => String(a.user) === String(s._id));
      const schedule = schedules.find(sch => sch && String(sch.user) === String(s._id));
      const onLeave = onLeaveIds.includes(String(s._id));
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        avatar: s.avatar,
        status: onLeave ? 'on_leave' : att ? att.status : 'absent',
        clockIn: att?.clockIn,
        clockOut: att?.clockOut,
        totalHours: att?.totalHours || 0,
        isLate: att?.isLate || false,
        lateMinutes: att?.lateMinutes || 0,
        shift: schedule?.shift || att?.shift || null,
        onBreak: att?.status === ATTENDANCE_STATUS.ON_BREAK
      };
    });

    res.json(apiResponse(true, 'Dashboard data retrieved', {
      stats: {
        totalStaff: staff.length,
        present: present.length,
        absent: absentCount,
        late: late.length,
        currentlyWorking: currentlyWorking.length,
        onBreak: onBreak.length,
        onLeave: onLeaveIds.length,
        clockedOut: clockedOut.length
      },
      dailyChart,
      monthChart,
      weeklyHours: weeklyHours[0] || { totalHours: 0, totalOvertime: 0 },
      employees: employeeList,
      upcomingShifts,
      date: today
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/employees', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = { role: { $in: ['admin', 'super_admin', 'kitchen_staff', 'delivery_driver', 'cashier', 'waiter'] } };
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const staff = await User.find(query).select('name email role avatar phone createdAt');
    res.json(apiResponse(true, 'Employees retrieved', staff));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/attendance-report', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { start, end, userId } = req.query;
    if (!start || !end) return res.status(400).json(apiResponse(false, 'start and end dates required'));
    const query = { date: { $gte: start, $lte: end } };
    if (userId) query.user = userId;
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('user', 'name email role avatar')
      .populate('shift', 'name startTime endTime');
    const summary = {
      totalRecords: records.length,
      totalHours: records.reduce((s, r) => s + (r.totalHours || 0), 0),
      totalOvertime: records.reduce((s, r) => s + (r.overtimeHours || 0), 0),
      lateCount: records.filter(r => r.isLate).length,
      earlyDepartureCount: records.filter(r => r.isEarlyDeparture).length
    };
    res.json(apiResponse(true, 'Report retrieved', { records, summary }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/summary', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const { userId, start, end } = req.query;
    if (!userId || !start || !end) return res.status(400).json(apiResponse(false, 'userId, start, and end required'));
    const records = await Attendance.find({
      user: userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).populate('shift');
    const totalHours = records.reduce((s, r) => s + (r.totalHours || 0), 0);
    const totalOvertime = records.reduce((s, r) => s + (r.overtimeHours || 0), 0);
    const lateDays = records.filter(r => r.isLate).length;
    const presentDays = records.filter(r => r.clockIn).length;
    res.json(apiResponse(true, 'Employee summary retrieved', {
      records, totalHours, totalOvertime, lateDays, presentDays, totalDays: records.length
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.put('/records/:id', authenticate, authorize(...ADMIN), async (req, res) => {
  try {
    const allowed = ['clockIn', 'clockOut', 'notes', 'isLate', 'lateMinutes', 'isEarlyDeparture', 'earlyDepartureMinutes'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const record = await Attendance.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!record) return res.status(404).json(apiResponse(false, 'Record not found'));
    res.json(apiResponse(true, 'Record updated', record));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
