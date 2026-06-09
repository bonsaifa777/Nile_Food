import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Attendance from '../models/Attendance.js';
import Shift from '../models/Shift.js';
import EmployeeSchedule from '../models/EmployeeSchedule.js';
import DailyQRCode from '../models/DailyQRCode.js';
import User from '../models/User.js';
import { ATTENDANCE_STATUS, STAFF_ROLES, GPS_RADIUS, ATTENDANCE_SOCKET_EVENTS } from '../shared/constants.js';
import { apiResponse } from '../shared/utils.js';

const router = Router();

const STAFF = STAFF_ROLES;

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/status', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const today = getTodayStr();
    let attendance = await Attendance.findOne({ user: req.user.id, date: today }).populate('shift');

    let hasActiveShift = false;
    let currentShift = null;

    const schedule = await EmployeeSchedule.findOne({ user: req.user.id, date: today }).populate('shift');
    if (schedule && schedule.shift) {
      hasActiveShift = true;
      currentShift = schedule.shift;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let shiftStatus = 'no_shift';
    if (currentShift) {
      if (currentTime < currentShift.startTime) shiftStatus = 'upcoming';
      else if (currentTime >= currentShift.startTime && currentTime <= currentShift.endTime) shiftStatus = 'active';
      else shiftStatus = 'ended';
    }

    if (!attendance) {
      return res.json(apiResponse(true, 'Attendance status retrieved', {
        status: 'not_clocked_in',
        shift: currentShift,
        hasActiveShift,
        shiftStatus,
        today: { date: today, clockIn: null, clockOut: null, totalHours: 0, overtimeHours: 0 }
      }));
    }

    res.json(apiResponse(true, 'Attendance status retrieved', {
      status: attendance.status,
      shift: currentShift || attendance.shift,
      hasActiveShift,
      shiftStatus,
      today: {
        date: attendance.date,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        totalHours: attendance.totalHours,
        overtimeHours: attendance.overtimeHours,
        totalBreakDuration: attendance.totalBreakDuration,
        isLate: attendance.isLate,
        lateMinutes: attendance.lateMinutes,
        isEarlyDeparture: attendance.isEarlyDeparture,
        earlyDepartureMinutes: attendance.earlyDepartureMinutes,
        breaks: attendance.breaks
      }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/clock-in', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const today = getTodayStr();
    const { latitude, longitude, accuracy, qrCode, faceResult, faceConfidence } = req.body;

    const existing = await Attendance.findOne({ user: req.user.id, date: today });
    if (existing) {
      if (existing.status === ATTENDANCE_STATUS.CLOCKED_IN || existing.status === ATTENDANCE_STATUS.ON_BREAK) {
        return res.status(400).json(apiResponse(false, 'Already clocked in today'));
      }
      if (existing.clockOut) {
        return res.status(400).json(apiResponse(false, 'Already clocked out today'));
      }
    }

    if (qrCode) {
      const qr = await DailyQRCode.findOne({ code: qrCode, date: today, isActive: true });
      if (!qr) {
        return res.status(400).json(apiResponse(false, 'Invalid or expired QR code'));
      }
      if (new Date() > qr.expiresAt) {
        return res.status(400).json(apiResponse(false, 'QR code has expired'));
      }
      qr.usedCount += 1;
      await qr.save();
    }

    const settings = await (await import('../models/Settings.js')).default.findOne({}).lean();
    const restLocation = settings?.restaurantLocation || { latitude: 0, longitude: 0 };
    const allowedRadius = settings?.attendanceRadius || 100;

    let locationValid = true;
    if (latitude && longitude && restLocation.latitude && restLocation.longitude) {
      const distance = getDistanceFromLatLonInM(latitude, longitude, restLocation.latitude, restLocation.longitude);
      if (distance > allowedRadius) {
        locationValid = false;
        return res.status(400).json(apiResponse(false, `Location out of range. You are ${Math.round(distance)}m away from the workplace (max ${allowedRadius}m)`));
      }
    }

    let schedule = await EmployeeSchedule.findOne({ user: req.user.id, date: today }).populate('shift');
    if (!schedule) {
      const generalShift = await Shift.findOne({ type: 'morning', isActive: true });
      if (generalShift) {
        schedule = { shift: generalShift };
      }
    }

    let isLate = false;
    let lateMinutes = 0;
    if (schedule && schedule.shift) {
      const now = new Date();
      const shiftStartParts = schedule.shift.startTime.split(':');
      const shiftStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(shiftStartParts[0]), parseInt(shiftStartParts[1]));
      const graceEnd = new Date(shiftStart.getTime() + schedule.shift.gracePeriodMinutes * 60000);
      if (now > graceEnd) {
        isLate = true;
        lateMinutes = Math.round((now - shiftStart) / 60000);
      }
    }

    const attendanceData = {
      user: req.user.id,
      date: today,
      status: ATTENDANCE_STATUS.CLOCKED_IN,
      clockIn: new Date(),
      shift: schedule?.shift?._id,
      isLate,
      lateMinutes,
      verificationMethod: 'none',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      createdBy: req.user.id
    };

    if (qrCode) {
      attendanceData.qrCode = qrCode;
      attendanceData.verificationMethod = 'qr';
    }

    if (latitude && longitude) {
      attendanceData.location = {
        clockIn: { latitude, longitude, accuracy }
      };
      if (attendanceData.verificationMethod === 'none') {
        attendanceData.verificationMethod = 'gps';
      } else {
        attendanceData.verificationMethod = 'gps+qr';
      }
    }

    if (faceResult) {
      attendanceData.faceVerification = {
        clockIn: { timestamp: new Date(), result: faceResult, confidence: faceConfidence }
      };
      attendanceData.verificationMethod = attendanceData.verificationMethod === 'gps' ? 'gps+face' : 'face';
    }

    const attendance = existing ? await Attendance.findByIdAndUpdate(existing._id, { $set: attendanceData }, { new: true }) : await Attendance.create(attendanceData);

    const user = await User.findById(req.user.id).select('name role avatar');
    if (req.io) {
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.ATTENDANCE_UPDATE, {
        userId: req.user.id,
        userName: user.name,
        userRole: user.role,
        action: 'clock_in',
        timestamp: attendance.clockIn,
        isLate
      });
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.EMPLOYEE_STATUS, {
        userId: req.user.id,
        userName: user.name,
        userRole: user.role,
        status: 'clocked_in',
        timestamp: new Date()
      });
    }

    res.json(apiResponse(true, 'Clocked in successfully', {
      attendance,
      isLate,
      lateMinutes
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/clock-out', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const today = getTodayStr();
    const { latitude, longitude, faceResult, faceConfidence } = req.body;

    const attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json(apiResponse(false, 'No clock-in record found for today'));
    }
    if (attendance.clockOut) {
      return res.status(400).json(apiResponse(false, 'Already clocked out today'));
    }

    if (attendance.status === ATTENDANCE_STATUS.ON_BREAK) {
      const lastBreak = attendance.breaks[attendance.breaks.length - 1];
      if (lastBreak && !lastBreak.end) {
        lastBreak.end = new Date();
        lastBreak.duration = Math.round((lastBreak.end - lastBreak.start) / 60000);
      }
    }

    const settings = await (await import('../models/Settings.js')).default.findOne({}).lean();
    const restLocation = settings?.restaurantLocation || { latitude: 0, longitude: 0 };
    const allowedRadius = settings?.attendanceRadius || 100;

    if (latitude && longitude && restLocation.latitude && restLocation.longitude) {
      const distance = getDistanceFromLatLonInM(latitude, longitude, restLocation.latitude, restLocation.longitude);
      if (distance > allowedRadius) {
        return res.status(400).json(apiResponse(false, `Location out of range. You are ${Math.round(distance)}m away from the workplace (max ${allowedRadius}m)`));
      }
    }

    if (!attendance.location) attendance.location = {};
    if (latitude && longitude) {
      attendance.location.clockOut = { latitude, longitude };
    }

    attendance.clockOut = new Date();
    attendance.status = ATTENDANCE_STATUS.CLOCKED_OUT;

    if (faceResult) {
      if (!attendance.faceVerification) attendance.faceVerification = {};
      attendance.faceVerification.clockOut = { timestamp: new Date(), result: faceResult, confidence: faceConfidence };
    }

    let isEarlyDeparture = false;
    let earlyDepartureMinutes = 0;
    if (attendance.shift) {
      const shift = await Shift.findById(attendance.shift);
      if (shift) {
        const now = new Date();
        const shiftEndParts = shift.endTime.split(':');
        const shiftEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(shiftEndParts[0]), parseInt(shiftEndParts[1]));
        if (now < shiftEnd) {
          isEarlyDeparture = true;
          earlyDepartureMinutes = Math.round((shiftEnd - now) / 60000);
        }
      }
    }

    attendance.isEarlyDeparture = isEarlyDeparture;
    attendance.earlyDepartureMinutes = earlyDepartureMinutes;
    attendance.totalHours = attendance.calculateTotalHours();
    attendance.overtimeHours = attendance.calculateOvertime(8);

    await attendance.save();

    const user = await User.findById(req.user.id).select('name role avatar');
    if (req.io) {
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.ATTENDANCE_UPDATE, {
        userId: req.user.id,
        userName: user.name,
        userRole: user.role,
        action: 'clock_out',
        timestamp: attendance.clockOut,
        totalHours: attendance.totalHours
      });
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.EMPLOYEE_STATUS, {
        userId: req.user.id,
        userName: user.name,
        userRole: user.role,
        status: 'clocked_out',
        timestamp: new Date()
      });
    }

    res.json(apiResponse(true, 'Clocked out successfully', {
      attendance: {
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        totalHours: attendance.totalHours,
        overtimeHours: attendance.overtimeHours,
        totalBreakDuration: attendance.totalBreakDuration,
        isEarlyDeparture,
        earlyDepartureMinutes
      }
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/break/start', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const today = getTodayStr();
    const attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json(apiResponse(false, 'No clock-in record found'));
    }
    if (attendance.status === ATTENDANCE_STATUS.CLOCKED_OUT) {
      return res.status(400).json(apiResponse(false, 'Already clocked out'));
    }
    if (attendance.status === ATTENDANCE_STATUS.ON_BREAK) {
      return res.status(400).json(apiResponse(false, 'Already on break'));
    }

    attendance.breaks.push({ start: new Date(), end: null, duration: 0 });
    attendance.status = ATTENDANCE_STATUS.ON_BREAK;
    await attendance.save();

    const user = await User.findById(req.user.id).select('name role avatar');
    if (req.io) {
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.EMPLOYEE_STATUS, {
        userId: req.user.id, userName: user.name, userRole: user.role,
        status: 'on_break', timestamp: new Date()
      });
    }

    res.json(apiResponse(true, 'Break started', { attendance }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.post('/break/end', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const today = getTodayStr();
    const attendance = await Attendance.findOne({ user: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json(apiResponse(false, 'No clock-in record found'));
    }
    if (attendance.status !== ATTENDANCE_STATUS.ON_BREAK) {
      return res.status(400).json(apiResponse(false, 'Not on break'));
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];
    if (lastBreak && !lastBreak.end) {
      lastBreak.end = new Date();
      lastBreak.duration = Math.round((lastBreak.end - lastBreak.start) / 60000);
    }

    attendance.totalBreakDuration = attendance.breaks
      .filter(b => b.end)
      .reduce((sum, b) => sum + (b.duration || 0), 0);
    attendance.status = ATTENDANCE_STATUS.CLOCKED_IN;
    await attendance.save();

    const user = await User.findById(req.user.id).select('name role avatar');
    if (req.io) {
      req.io.emit(ATTENDANCE_SOCKET_EVENTS.EMPLOYEE_STATUS, {
        userId: req.user.id, userName: user.name, userRole: user.role,
        status: 'clocked_in', timestamp: new Date()
      });
    }

    res.json(apiResponse(true, 'Break ended', { attendance }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/history', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const { start, end, limit = 30, page = 1 } = req.query;
    const query = { user: req.user.id };
    if (start && end) {
      query.date = { $gte: start, $lte: end };
    }
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('shift', 'name startTime endTime');
    res.json(apiResponse(true, 'Attendance history retrieved', {
      records, total, page: parseInt(page), pages: Math.ceil(total / limit)
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/weekly', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const weekStart = getWeekStart();
    const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const records = await Attendance.find({ user: req.user.id, date: { $gte: weekStart, $lte: weekEnd } })
      .sort({ date: 1 })
      .populate('shift', 'name startTime endTime');
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    res.json(apiResponse(true, 'Weekly attendance retrieved', { records, totalHours, totalOvertime, weekStart, weekEnd }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

router.get('/monthly', authenticate, authorize(...STAFF), async (req, res) => {
  try {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const records = await Attendance.find({ user: req.user.id, date: { $gte: monthStart, $lte: monthEnd } })
      .sort({ date: 1 });
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const lateDays = records.filter(r => r.isLate).length;
    const presentDays = records.filter(r => r.clockIn).length;
    res.json(apiResponse(true, 'Monthly attendance retrieved', {
      records, totalHours, totalOvertime, lateDays, presentDays, monthStart, monthEnd
    }));
  } catch (error) {
    res.status(500).json(apiResponse(false, error.message));
  }
});

export default router;
