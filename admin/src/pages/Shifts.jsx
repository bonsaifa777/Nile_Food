import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCalendar } from 'react-icons/fi';
import { getShifts, createShift, updateShift, deleteShift, getSchedules, assignShift, deleteSchedule } from '../services/attendanceApi';
import { getEmployees } from '../services/attendanceApi';
import toast from 'react-hot-toast';

const shiftColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('shifts');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '', type: 'custom', startTime: '09:00', endTime: '17:00',
    gracePeriodMinutes: 15, breakDurationMinutes: 30, description: '', color: '#6366f1'
  });

  const [assignForm, setAssignForm] = useState({
    userId: '', shiftId: '', date: today
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, sch, emp] = await Promise.all([
        getShifts(),
        getSchedules({ start: today, end: today }),
        getEmployees()
      ]);
      if (s.success) setShifts(s.data);
      if (sch.success) setSchedules(sch.data);
      if (emp.success) setEmployees(emp.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editing) {
        const res = await updateShift(editing, form);
        if (res.success) toast.success('Shift updated');
      } else {
        const res = await createShift(form);
        if (res.success) toast.success('Shift created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', type: 'custom', startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15, breakDurationMinutes: 30, description: '', color: '#6366f1' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shift');
    }
  };

  const handleEdit = (shift) => {
    setForm({
      name: shift.name, type: shift.type, startTime: shift.startTime, endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes, breakDurationMinutes: shift.breakDurationMinutes,
      description: shift.description || '', color: shift.color || '#6366f1'
    });
    setEditing(shift._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this shift?')) return;
    try {
      const res = await deleteShift(id);
      if (res.success) toast.success('Shift deactivated');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete shift');
    }
  };

  const handleAssign = async () => {
    if (!assignForm.userId || !assignForm.shiftId) {
      return toast.error('Select employee and shift');
    }
    try {
      const res = await assignShift(assignForm);
      if (res.success) toast.success('Shift assigned');
      setShowAssign(false);
      setAssignForm({ userId: '', shiftId: '', date: today });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleRemoveSchedule = async (id) => {
    try {
      await deleteSchedule(id);
      toast.success('Schedule removed');
      fetchAll();
    } catch (err) {
      toast.error('Failed to remove schedule');
    }
  };

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Shift Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create, assign, and manage work shifts</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowAssign(true); setShowForm(false); }} className="btn-ghost flex items-center gap-2 text-sm">
            <FiCalendar size={14} /> Assign Shift
          </button>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', type: 'custom', startTime: '09:00', endTime: '17:00', gracePeriodMinutes: 15, breakDurationMinutes: 30, description: '', color: shiftColors[shifts.length % shiftColors.length] }); }} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={14} /> New Shift
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['shifts', 'assignments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editing ? 'Edit Shift' : 'Create Shift'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="Morning Shift" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-glass">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Grace Period (min)</label>
              <input type="number" value={form.gracePeriodMinutes} onChange={e => setForm({ ...form, gracePeriodMinutes: parseInt(e.target.value) })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Break Duration (min)</label>
              <input type="number" value={form.breakDurationMinutes} onChange={e => setForm({ ...form, breakDurationMinutes: parseInt(e.target.value) })} className="input-glass" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
              <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-glass" placeholder="Optional description" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="btn-primary text-sm">{editing ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-ghost text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {showAssign && (
        <motion.div initial={{ opacity: 0, y: -10 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Assign Shift</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Employee</label>
              <select value={assignForm.userId} onChange={e => setAssignForm({ ...assignForm, userId: e.target.value })} className="input-glass">
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.role?.replace(/_/g, ' ')})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Shift</label>
              <select value={assignForm.shiftId} onChange={e => setAssignForm({ ...assignForm, shiftId: e.target.value })} className="input-glass">
                <option value="">Select shift</option>
                {shifts.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Date</label>
              <input type="date" value={assignForm.date} onChange={e => setAssignForm({ ...assignForm, date: e.target.value })} className="input-glass" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAssign} className="btn-primary text-sm">Assign</button>
            <button onClick={() => setShowAssign(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift, i) => (
            <motion.div
              key={shift._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: shift.color || '#6366f1' }} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{shift.name}</h4>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{shift.type}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(shift)} className="p-1.5 rounded-lg hover:bg-white/5"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(shift._id)} className="p-1.5 rounded-lg hover:bg-white/5 text-red-400"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <FiClock size={14} className="text-indigo-400" />
                <span style={{ color: 'var(--text-secondary)' }}>{shift.startTime} - {shift.endTime}</span>
              </div>
              <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Grace: {shift.gracePeriodMinutes}min</span>
                <span>Break: {shift.breakDurationMinutes}min</span>
              </div>
              {shift.description && (
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{shift.description}</p>
              )}
            </motion.div>
          ))}
          {shifts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No shifts created yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Today's Assignments</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-3 pr-4">Employee</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Shift</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={s._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {s.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{s.user?.role?.replace(/_/g, ' ')}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: `${s.shift?.color}20`, color: s.shift?.color }}>
                        {s.shift?.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.shift?.startTime} - {s.shift?.endTime}</td>
                    <td className="py-3 pr-4">
                      <button onClick={() => handleRemoveSchedule(s._id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No assignments for today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
