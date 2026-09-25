import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiUsers, FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiMail, FiPhone,
  FiBriefcase, FiDollarSign, FiCalendar, FiUpload, FiFileText, FiX,
  FiDownload, FiUserCheck, FiMapPin, FiCheckCircle, FiAlertTriangle,
  FiPaperclip, FiCreditCard, FiChevronRight, FiUser
} from 'react-icons/fi';
import { exportEmployeesPdf } from '../utils/pdfReport';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'];
const DEPARTMENTS = ['Management', 'Kitchen', 'Service', 'Cashier', 'Delivery', 'Maintenance', 'Administration', 'Marketing', 'Other'];
const STATUSES = ['Active', 'On Leave', 'Terminated', 'Suspended'];

const STATUS_STYLES = {
  Active: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  'On Leave': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  Terminated: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  Suspended: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' }
};

const DEPT_COLORS = {
  Management: '#8b5cf6',
  Kitchen: '#f97316',
  Service: '#38bdf8',
  Cashier: '#10b981',
  Delivery: '#f59e0b',
  Maintenance: '#64748b',
  Administration: '#ec4899',
  Marketing: '#a855f7',
  Other: '#94a3b8'
};

const EMPTY_FORM = {
  name: '', email: '', phone: '', position: '', department: 'Other',
  gender: 'Male', dateOfBirth: '', address: '', city: '',
  emergencyName: '', emergencyPhone: '', emergencyRelationship: '',
  employmentType: 'Full-time', monthlySalary: '', hireDate: '', status: 'Active',
  nationalIdNumber: '', notes: ''
};

function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const target = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
    if (isNaN(target)) { setDisplay(value); return; }
    const from = prevRef.current;
    prevRef.current = target;
    const startTime = performance.now();
    const duration = 800;
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function UploadField({ label, required, accept, value, preview, onFile, helper }) {
  const inputRef = useRef(null);
  const isImage = preview && preview.startsWith('data:image');

  return (
    <div>
      <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:border-primary-500/40"
        style={{ background: 'var(--input-bg)', border: '1.5px dashed var(--input-border)' }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {preview && isImage ? (
            <img src={preview} alt={label} className="w-9 h-9 rounded-lg object-cover" />
          ) : preview ? (
            <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <FiCheckCircle size={16} />
            </span>
          ) : (
            <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
              <FiUpload size={15} />
            </span>
          )}
          <span className="text-sm truncate" style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {typeof value === 'string' && value ? value.split('/').pop() : value ? value.name : 'Choose file...'}
          </span>
        </span>
        <FiPaperclip size={15} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 120, damping: 16 }
  })
};

function TextField({ label, required, name, type = 'text', placeholder, className = '', value, onChange }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} name={name} value={value || ''} onChange={onChange} className="input-glass" placeholder={placeholder} required={required} />
    </div>
  );
}

function SelectField({ label, required, name, options, className = '', value, onChange }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select name={name} value={value || ''} onChange={onChange} className="input-glass cursor-pointer" required={required}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function NileEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [nationalIdFront, setNationalIdFront] = useState(null);
  const [nationalIdBack, setNationalIdBack] = useState(null);
  const [experienceDocument, setExperienceDocument] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/nile-employees');
      setEmployees(data.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const departments = useMemo(() => {
    const set = new Set(DEPARTMENTS);
    employees.forEach(e => e.department && set.add(e.department));
    return [...set];
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
      const mSearch = !q || [e.name, e.email, e.phone, e.position, e.employeeCode, e.department]
        .some(v => (v || '').toLowerCase().includes(q));
      const mDept = departmentFilter === 'All' || e.department === departmentFilter;
      const mStatus = statusFilter === 'All' || e.status === statusFilter;
      return mSearch && mDept && mStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const stats = useMemo(() => {
    const monthlyPayroll = employees.reduce((s, e) => s + (e.monthlySalary || 0), 0);
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'Active').length,
      onLeave: employees.filter(e => e.status === 'On Leave').length,
      payroll: monthlyPayroll
    };
  }, [employees]);

  const statCards = [
    { title: 'Total Employees', value: stats.total, icon: FiUsers, gradient: ['#6366f1', '#8b5cf6'], glow: 'rgba(99,102,241,0.25)' },
    { title: 'Monthly Payroll', value: stats.payroll, prefix: 'ETB ', icon: FiDollarSign, gradient: ['#10b981', '#34d399'], glow: 'rgba(16,185,129,0.25)' },
    { title: 'Active Now', value: stats.active, icon: FiUserCheck, gradient: ['#f59e0b', '#fbbf24'], glow: 'rgba(245,158,11,0.25)' },
    { title: 'On Leave', value: stats.onLeave, icon: FiAlertTriangle, gradient: ['#3b82f6', '#38bdf8'], glow: 'rgba(59,130,246,0.25)' }
  ];

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setNationalIdFront(null);
    setNationalIdBack(null);
    setExperienceDocument(null);
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setFormData({
      name: emp.name || '', email: emp.email || '', phone: emp.phone || '',
      position: emp.position || '', department: emp.department || 'Other',
      gender: emp.gender || 'Male', dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : '',
      address: emp.address || '', city: emp.city || '',
      emergencyName: emp.emergencyContact?.name || '',
      emergencyPhone: emp.emergencyContact?.phone || '',
      emergencyRelationship: emp.emergencyContact?.relationship || '',
      employmentType: emp.employmentType || 'Full-time',
      monthlySalary: emp.monthlySalary ?? '', hireDate: emp.hireDate ? emp.hireDate.slice(0, 10) : '',
      status: emp.status || 'Active',
      nationalIdNumber: emp.nationalId?.number || '', notes: emp.notes || ''
    });
    setNationalIdFront(null);
    setNationalIdBack(null);
    setExperienceDocument(null);
    setShowModal(true);
  };

  const filePreview = (file) => {
    if (!file) return null;
    if (file.type?.startsWith('image/')) return URL.createObjectURL(file);
    return 'document';
  };

  const uploadsRequired = (file) => {
    const requiredFiles = {
      nationalIdFront: { value: file.nationalIdFront, existing: editing?.nationalId?.frontImage, label: 'National ID Front' },
      nationalIdBack: { value: file.nationalIdBack, existing: editing?.nationalId?.backImage, label: 'National ID Back' },
      experienceDocument: { value: file.experienceDocument, existing: editing?.experienceDocument, label: 'Experience Document' }
    };
    for (const [field, spec] of Object.entries(requiredFiles)) {
      if (!spec.value && !spec.existing) {
        return `Please upload the ${spec.label}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.position || !formData.nationalIdNumber || !formData.monthlySalary || !formData.hireDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const missing = uploadsRequired({ nationalIdFront, nationalIdBack, experienceDocument });
    if (missing) {
      toast.error(missing);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (nationalIdFront) fd.append('nationalIdFront', nationalIdFront);
      if (nationalIdBack) fd.append('nationalIdBack', nationalIdBack);
      if (experienceDocument) fd.append('experienceDocument', experienceDocument);

      if (editing) {
        await axios.put(`/api/nile-employees/${editing._id}`, fd);
        toast.success('Employee updated', { style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' } });
      } else {
        await axios.post('/api/nile-employees', fd);
        toast.success('Employee added', { style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' } });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Remove ${emp.name} from the employee directory?`)) return;
    try {
      await axios.delete(`/api/nile-employees/${emp._id}`);
      toast.success('Employee removed');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to remove employee');
    }
  };

  const handleExportPdf = () => {
    exportEmployeesPdf({ title: 'Nile Employees Report', employees: employees });
  };

  const fileUrl = (name) => (name ? `/uploads/employees/${encodeURIComponent(name)}` : null);

  const setField = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass p-6 md:p-8"
      >
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 pulse-dot inline-block" />
                Human Resources
              </span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Nile Employees
            </h1>
            <p className="text-sm mt-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <FiBriefcase size={12} className="text-purple-400" />
              {stats.total} employees · {stats.active} active · {new Date().getFullYear()} payroll registry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(16,185,129,0.35)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExportPdf}
              className="btn-ghost flex items-center gap-2"
              style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}
            >
              <FiDownload size={16} /> Export PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.96 }}
              onClick={openCreate}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={18} /> Add Employee
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="glass-card group relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${stat.gradient[0]}, transparent 70%)` }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-bold mt-2 tracking-tight tabular-nums" style={{ background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} />
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`, boxShadow: `0 8px 28px ${stat.glow}` }}
              >
                <stat.icon size={22} className="text-white" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Directory Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiUsers size={16} className="text-purple-400" />
              Employee Directory
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} of {employees.length} employees shown
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, position, phone..."
                className="input-glass pl-10"
              />
            </div>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="input-glass sm:w-44 cursor-pointer">
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-glass sm:w-40 cursor-pointer">
              <option value="All">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <FiUsers size={28} style={{ color: '#a78bfa' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No employees found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {search || departmentFilter !== 'All' || statusFilter !== 'All' ? 'Try adjusting your filters' : 'Click "Add Employee" to register your first employee'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Employee', 'Position', 'Department', 'Contact', 'Monthly Salary', 'Status', 'Hire Date', 'Documents', 'Actions'].map((header) => (
                      <th key={header} className="text-left py-3 px-6 text-xs font-medium uppercase tracking-widest text-gray-500 sticky top-0" style={{ background: 'rgba(15,23,42,0.98)' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => {
                    const st = STATUS_STYLES[emp.status] || STATUS_STYLES.Active;
                    const deptColor = DEPT_COLORS[emp.department] || '#94a3b8';
                    const docCount = [emp.nationalId?.frontImage, emp.nationalId?.backImage, emp.experienceDocument].filter(Boolean).length;
                    return (
                      <motion.tr
                        key={emp._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02, type: 'spring', stiffness: 200, damping: 26 }}
                        className="group"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        whileHover={{ background: 'rgba(139,92,246,0.04)' }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                              {emp.name?.charAt(0).toUpperCase() || <FiUser size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                              <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{emp.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1.5"><FiBriefcase size={12} className="opacity-60" />{emp.position}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: deptColor }}>
                            {emp.department}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                              <FiPhone size={11} className="opacity-60" />{emp.phone}
                            </p>
                            <p className="text-xs flex items-center gap-1.5 truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
                              <FiMail size={11} className="opacity-60" />{emp.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold tabular-nums text-emerald-400">
                          ETB {Number(emp.monthlySalary || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-400">
                          {emp.hireDate ? format(new Date(emp.hireDate), 'MMM d, yyyy') : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelected(emp)}
                            title="View documents"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                            style={{ background: docCount === 3 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${docCount === 3 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`, color: docCount === 3 ? '#34d399' : '#fbbf24' }}
                          >
                            <FiPaperclip size={12} /> {docCount}/3
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => setSelected(emp)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg transition-colors hover:bg-white/10"
                              style={{ color: 'var(--text-secondary)' }}
                              title="View"
                            >
                              <FiEye size={15} />
                            </motion.button>
                            <motion.button
                              onClick={() => openEdit(emp)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg transition-colors hover:bg-white/10"
                              style={{ color: 'var(--text-secondary)' }}
                              title="Edit"
                            >
                              <FiEdit2 size={15} />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(emp)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); setEditing(null); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl glass p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
                    <FiUsers size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {editing ? 'Edit Employee' : 'Register Employee'}
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fields marked with * are mandatory</p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <FiUser size={14} style={{ color: '#8b5cf6' }} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Full Name" required name="name" value={formData.name} onChange={setField} placeholder="e.g. Abebe Bekele" className="md:col-span-2" />
                  <TextField label="Email Address" required type="email" name="email" value={formData.email} onChange={setField} placeholder="employee@nilefood.com" />
                  <TextField label="Phone Number" required type="tel" name="phone" value={formData.phone} onChange={setField} placeholder="+251 9XX XXX XXX" />
                  <SelectField label="Gender" required name="gender" value={formData.gender} onChange={setField} options={['Male', 'Female', 'Other']} />
                  <TextField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={setField} />
                  <TextField label="Address" name="address" value={formData.address} onChange={setField} placeholder="Street / House number" className="md:col-span-1" />
                  <TextField label="City" name="city" value={formData.city} onChange={setField} placeholder="e.g. Addis Ababa" />
                </div>

                <hr className="border-white/5" />
                <div className="flex items-center gap-2 mb-1">
                  <FiBriefcase size={14} style={{ color: '#10b981' }} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Employment Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Job Position" required name="position" value={formData.position} onChange={setField} placeholder="e.g. Head Chef" />
                  <SelectField label="Department" required name="department" value={formData.department} onChange={setField} options={DEPARTMENTS} />
                  <SelectField label="Employment Type" required name="employmentType" value={formData.employmentType} onChange={setField} options={EMPLOYMENT_TYPES} />
                  <TextField label="Hire Date" required type="date" name="hireDate" value={formData.hireDate} onChange={setField} />
                  <TextField label="Monthly Salary (ETB)" required type="number" min="0" name="monthlySalary" value={formData.monthlySalary} onChange={setField} placeholder="e.g. 25000" />
                  <SelectField label="Employment Status" required name="status" value={formData.status} onChange={setField} options={STATUSES} />
                </div>

                <hr className="border-white/5" />
                <div className="flex items-center gap-2 mb-1">
                  <FiAlertTriangle size={14} style={{ color: '#f59e0b' }} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Secure Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="National ID Number" required name="nationalIdNumber" value={formData.nationalIdNumber} onChange={setField} placeholder="e.g. 12-3456789" className="md:col-span-2" />
                  <UploadField
                    label="National ID - Front"
                    required
                    accept="image/*,.pdf"
                    value={nationalIdFront || (editing?.nationalId?.frontImage && editing.nationalId.frontImage)}
                    preview={filePreview(nationalIdFront) || (editing?.nationalId?.frontImage ? `/uploads/employees/${encodeURIComponent(editing.nationalId.frontImage)}` : null)}
                    onFile={(e) => setNationalIdFront(e.target.files?.[0] || null)}
                  />
                  <UploadField
                    label="National ID - Back"
                    required
                    accept="image/*,.pdf"
                    value={nationalIdBack || (editing?.nationalId?.backImage && editing.nationalId.backImage)}
                    preview={filePreview(nationalIdBack) || (editing?.nationalId?.backImage ? `/uploads/employees/${encodeURIComponent(editing.nationalId.backImage)}` : null)}
                    onFile={(e) => setNationalIdBack(e.target.files?.[0] || null)}
                  />
                  <UploadField
                    label="Experience Document"
                    required
                    accept="image/*,.pdf"
                    value={experienceDocument || (editing?.experienceDocument && editing.experienceDocument)}
                    preview={filePreview(experienceDocument) || (editing?.experienceDocument ? `/uploads/employees/${encodeURIComponent(editing.experienceDocument)}` : null)}
                    onFile={(e) => setExperienceDocument(e.target.files?.[0] || null)}
                    helper="CV, certificate, or work experience letter"
                  />
                </div>

                <hr className="border-white/5" />
                <div className="flex items-center gap-2 mb-1">
                  <FiMapPin size={14} style={{ color: '#38bdf8' }} />
                  <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField label="Contact Name" name="emergencyName" value={formData.emergencyName} onChange={setField} placeholder="Next of kin" />
                  <TextField label="Contact Phone" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={setField} placeholder="+251 9XX XXX XXX" />
                  <TextField label="Relationship" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={setField} placeholder="e.g. Spouse" />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={setField}
                    rows={3}
                    className="input-glass resize-none"
                    placeholder="Additional remarks..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 btn-ghost">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? 'Saving...' : <><FiChevronRight size={16} /> {editing ? 'Update Employee' : 'Register Employee'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail / Documents Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl glass p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.1))', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                    {selected.name?.charAt(0).toUpperCase() || <FiUser size={26} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{selected.employeeCode} · {selected.position}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  <FiX size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { icon: FiBriefcase, label: 'Department', value: selected.department, color: '#8b5cf6' },
                  { icon: FiCreditCard, label: 'Employment', value: selected.employmentType, color: '#10b981' },
                  { icon: FiDollarSign, label: 'Monthly Salary', value: `ETB ${Number(selected.monthlySalary || 0).toLocaleString()}`, color: '#34d399' },
                  { icon: FiCalendar, label: 'Hire Date', value: selected.hireDate ? format(new Date(selected.hireDate), 'MMM d, yyyy') : '-', color: '#38bdf8' },
                  { icon: FiPhone, label: 'Phone', value: selected.phone, color: '#f59e0b' },
                  { icon: FiMail, label: 'Email', value: selected.email, color: '#f472b6' },
                  { icon: FiMapPin, label: 'Address', value: [selected.address, selected.city].filter(Boolean).join(', ') || '-', color: '#a78bfa' },
                  { icon: FiAlertTriangle, label: 'Status', value: selected.status, color: STATUS_STYLES[selected.status]?.color || '#94a3b8' }
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${row.color}1a`, color: row.color }}>
                      <row.icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{row.label}</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <FiPaperclip size={14} className="text-purple-400" /> Official Documents
              </h3>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'National ID - Front', file: selected.nationalId?.frontImage },
                  { label: 'National ID - Back', file: selected.nationalId?.backImage },
                  { label: 'Experience Document', file: selected.experienceDocument }
                ].map((doc) => {
                  const url = doc.file ? fileUrl(doc.file) : null;
                  const isImage = url && /\.(jpe?g|png|gif|webp|avif)$/i.test(url);
                  return (
                    <div key={doc.label} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        {url && isImage ? (
                          <img src={url} alt={doc.label} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                            {url ? <FiFileText size={20} /> : <FiAlertTriangle size={20} className="text-gray-500" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.label}</p>
                          <p className="text-xs truncate font-mono" style={{ color: 'var(--text-muted)' }}>{doc.file ? `uploads/employees/${doc.file}` : 'Not uploaded'}</p>
                        </div>
                      </div>
                      {url ? (
                        <a href={url} target="_blank" rel="noreferrer"
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                          style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                          <FiDownload size={13} /> View
                        </a>
                      ) : (
                        <span className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {selected.notes && (
                <div className="p-3 rounded-xl mb-6" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#fbbf24' }}>Notes</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.notes}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}