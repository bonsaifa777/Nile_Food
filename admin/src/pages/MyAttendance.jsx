import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiCamera, FiCheckCircle, FiXCircle, FiCoffee } from 'react-icons/fi';
import { getAttendanceStatus, clockIn, clockOut, startBreak, endBreak, getWeeklyAttendance, getMonthlyAttendance } from '../services/attendanceApi';
import toast from 'react-hot-toast';

const ActionButton = ({ onClick, icon: Icon, label, color, disabled, loading }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled || loading}
    className={`relative overflow-hidden px-6 py-4 rounded-2xl font-semibold text-white transition-all ${
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    }`}
    style={{ background: `linear-gradient(135deg, ${color})` }}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )}
    <div className="flex items-center gap-3">
      <Icon size={22} />
      <span>{label}</span>
    </div>
  </motion.button>
);

export default function MyAttendance() {
  const [status, setStatus] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, w, m] = await Promise.all([
        getAttendanceStatus(),
        getWeeklyAttendance(),
        getMonthlyAttendance()
      ]);
      if (s.success) setStatus(s.data);
      if (w.success) setWeekly(w.data);
      if (m.success) setMonthly(m.data);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      let position = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        position = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
      } catch {}

      const payload = position ? { latitude: position.latitude, longitude: position.longitude, accuracy: position.accuracy } : {};
      const res = await clockIn(payload);
      if (res.success) {
        toast.success(res.message);
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      let position = null;
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
        });
        position = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch {}
      const payload = position ? { latitude: position.latitude, longitude: position.longitude } : {};
      const res = await clockOut(payload);
      if (res.success) {
        toast.success(res.message);
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakStart = async () => {
    setActionLoading(true);
    try {
      const res = await startBreak();
      if (res.success) {
        toast.success(res.message);
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start break');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakEnd = async () => {
    setActionLoading(true);
    try {
      const res = await endBreak();
      if (res.success) {
        toast.success(res.message);
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to end break');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const today = status?.today || {};
  const canClockIn = !today.clockIn;
  const canClockOut = today.clockIn && !today.clockOut;
  const isOnBreak = status?.status === 'on_break';
  const isClockedIn = status?.status === 'clocked_in';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Attendance</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track your work hours and attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isOnBreak ? 'bg-purple-500/10 text-purple-400' :
              isClockedIn ? 'bg-emerald-500/10 text-emerald-400' :
              canClockOut ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {isOnBreak ? 'On Break' : isClockedIn || canClockOut ? 'Active' : 'Not Clocked In'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {canClockIn && (
              <ActionButton onClick={handleClockIn} icon={FiClock} label="Clock In" color="#6366f1, #8b5cf6" disabled={actionLoading} loading={actionLoading} />
            )}
            {canClockOut && !isOnBreak && (
              <ActionButton onClick={handleClockOut} icon={FiCheckCircle} label="Clock Out" color="#ef4444, #dc2626" disabled={actionLoading} loading={actionLoading} />
            )}
            {isClockedIn && !isOnBreak && (
              <ActionButton onClick={handleBreakStart} icon={FiCoffee} label="Break Start" color="#8b5cf6, #7c3aed" disabled={actionLoading} loading={actionLoading} />
            )}
            {isOnBreak && (
              <ActionButton onClick={handleBreakEnd} icon={FiCoffee} label="Break End" color="#10b981, #059669" disabled={actionLoading} loading={actionLoading} />
            )}
          </div>

          {(!canClockIn && !canClockOut && !isClockedIn && !isOnBreak) && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>You have clocked out for today</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Today's Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Clock In</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {today.clockIn ? new Date(today.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Clock Out</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {today.clockOut ? new Date(today.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Hours</span>
              <span className="text-sm font-bold text-indigo-400">{today.totalHours || 0}h</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Overtime</span>
              <span className="text-sm font-medium" style={{ color: today.overtimeHours > 0 ? 'text-amber-400' : 'var(--text-primary)' }}>
                {today.overtimeHours || 0}h
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Break Duration</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{today.totalBreakDuration || 0}min</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Status</span>
              {today.isLate ? (
                <span className="text-sm font-medium text-red-400">{today.lateMinutes}min Late</span>
              ) : (
                <span className="text-sm font-medium text-emerald-400">On Time</span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>This Week</h3>
          {weekly?.records?.length > 0 ? (
            <div className="space-y-2">
              {weekly.records.map(r => (
                <div key={r._id} className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/[0.03]">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.totalHours || 0}h</span>
                    {r.isLate && <span className="text-xs text-red-400">{r.lateMinutes}min</span>}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-3 border-t font-bold" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="text-sm text-indigo-400">{weekly.totalHours}h ({weekly.totalOvertime}h OT)</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No records for this week</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>This Month</h3>
          {monthly ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl font-bold text-indigo-400">{monthly.presentDays || 0}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Present Days</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{monthly.totalHours || 0}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hours</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-2xl font-bold text-amber-400">{monthly.lateDays || 0}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Late Days</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Overtime</span>
                <span className="text-sm font-medium">{monthly.totalOvertime || 0}h</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No records for this month</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
