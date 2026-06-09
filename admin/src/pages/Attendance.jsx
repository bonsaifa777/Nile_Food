import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { getAdminDashboard } from '../services/attendanceApi';
import AttendanceStats from '../components/attendance/AttendanceStats';
import AttendanceChart from '../components/attendance/AttendanceChart';
import EmployeeStatusCard from '../components/attendance/EmployeeStatusCard';
import EmployeeTable from '../components/attendance/EmployeeTable';
import LiveStatusBar from '../components/attendance/LiveStatusBar';
import { FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await getAdminDashboard();
      if (res.success) setData(res.data);
    } catch (err) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const socket = io(import.meta.env.DEV ? 'http://localhost:5001' : window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socket.on('attendance_update', () => { fetchData(); });
    socket.on('employee_status', () => { fetchData(); });
    return () => socket.disconnect();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Attendance</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track and manage employee attendance</p>
        </div>
        <button onClick={fetchData} className="btn-ghost flex items-center gap-2 text-sm">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <LiveStatusBar stats={data?.stats} />
      <AttendanceStats stats={data?.stats} />
      <AttendanceChart dailyData={data?.dailyChart} monthlyData={data?.monthChart} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Currently Working</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {data?.employees?.filter(e => e.status === 'clocked_in').map((emp, i) => (
              <EmployeeStatusCard key={emp._id} employee={emp} index={i} />
            ))}
            {data?.employees?.filter(e => e.status === 'clocked_in').length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No employees currently working</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>On Break</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {data?.employees?.filter(e => e.status === 'on_break').map((emp, i) => (
              <EmployeeStatusCard key={emp._id} employee={emp} index={i} />
            ))}
            {data?.employees?.filter(e => e.status === 'on_break').length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No employees on break</p>
            )}
          </div>
        </motion.div>
      </div>

      <EmployeeTable employees={data?.employees} />
    </motion.div>
  );
}
