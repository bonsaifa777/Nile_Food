import axios from 'axios';

export const getAttendanceStatus = async () => {
  const { data } = await axios.get('/api/attendance/status');
  return data;
};

export const clockIn = async (payload = {}) => {
  const { data } = await axios.post('/api/attendance/clock-in', payload);
  return data;
};

export const clockOut = async (payload = {}) => {
  const { data } = await axios.post('/api/attendance/clock-out', payload);
  return data;
};

export const startBreak = async () => {
  const { data } = await axios.post('/api/attendance/break/start');
  return data;
};

export const endBreak = async () => {
  const { data } = await axios.post('/api/attendance/break/end');
  return data;
};

export const getAttendanceHistory = async (params = {}) => {
  const { data } = await axios.get('/api/attendance/history', { params });
  return data;
};

export const getWeeklyAttendance = async () => {
  const { data } = await axios.get('/api/attendance/weekly');
  return data;
};

export const getMonthlyAttendance = async () => {
  const { data } = await axios.get('/api/attendance/monthly');
  return data;
};

export const getAdminDashboard = async () => {
  const { data } = await axios.get('/api/admin/attendance/dashboard');
  return data;
};

export const getEmployees = async (params = {}) => {
  const { data } = await axios.get('/api/admin/attendance/employees', { params });
  return data;
};

export const getAttendanceReport = async (params = {}) => {
  const { data } = await axios.get('/api/admin/attendance/attendance-report', { params });
  return data;
};

export const getEmployeeSummary = async (params = {}) => {
  const { data } = await axios.get('/api/admin/attendance/summary', { params });
  return data;
};

export const updateAttendanceRecord = async (id, payload) => {
  const { data } = await axios.put(`/api/admin/attendance/records/${id}`, payload);
  return data;
};

export const getShifts = async () => {
  const { data } = await axios.get('/api/shifts');
  return data;
};

export const createShift = async (payload) => {
  const { data } = await axios.post('/api/shifts', payload);
  return data;
};

export const updateShift = async (id, payload) => {
  const { data } = await axios.put(`/api/shifts/${id}`, payload);
  return data;
};

export const deleteShift = async (id) => {
  const { data } = await axios.delete(`/api/shifts/${id}`);
  return data;
};

export const assignShift = async (payload) => {
  const { data } = await axios.post('/api/shifts/assign', payload);
  return data;
};

export const batchAssignShifts = async (assignments) => {
  const { data } = await axios.post('/api/shifts/assign-batch', { assignments });
  return data;
};

export const getSchedules = async (params = {}) => {
  const { data } = await axios.get('/api/shifts/schedule', { params });
  return data;
};

export const deleteSchedule = async (id) => {
  const { data } = await axios.delete(`/api/shifts/schedule/${id}`);
  return data;
};

export const getShiftCompliance = async (params = {}) => {
  const { data } = await axios.get('/api/shifts/compliance', { params });
  return data;
};

export const getLeaveRequests = async (params = {}) => {
  const { data } = await axios.get('/api/leave', { params });
  return data;
};

export const submitLeaveRequest = async (payload) => {
  const { data } = await axios.post('/api/leave', payload);
  return data;
};

export const approveLeaveRequest = async (id) => {
  const { data } = await axios.put(`/api/leave/${id}/approve`);
  return data;
};

export const rejectLeaveRequest = async (id, reason) => {
  const { data } = await axios.put(`/api/leave/${id}/reject`, { rejectionReason: reason });
  return data;
};

export const getLeaveBalance = async () => {
  const { data } = await axios.get('/api/leave/balance');
  return data;
};

export const getQRCode = async () => {
  const { data } = await axios.get('/api/qr-attendance/today');
  return data;
};

export const regenerateQRCode = async () => {
  const { data } = await axios.post('/api/qr-attendance/regenerate');
  return data;
};

export const toggleQRCode = async () => {
  const { data } = await axios.put('/api/qr-attendance/toggle');
  return data;
};

export const getQRHistory = async (params = {}) => {
  const { data } = await axios.get('/api/qr-attendance/history', { params });
  return data;
};

export const calculatePayroll = async (payload) => {
  const { data } = await axios.post('/api/payroll/calculate', payload);
  return data;
};

export const getPayrolls = async (params = {}) => {
  const { data } = await axios.get('/api/payroll', { params });
  return data;
};

export const approvePayroll = async (id) => {
  const { data } = await axios.put(`/api/payroll/${id}/approve`);
  return data;
};

export const payPayroll = async (id) => {
  const { data } = await axios.put(`/api/payroll/${id}/pay`);
  return data;
};

export const getMyPayroll = async () => {
  const { data } = await axios.get('/api/payroll/my-payroll');
  return data;
};

export const getDailyReport = async (params = {}) => {
  const { data } = await axios.get('/api/reports/daily', { params });
  return data;
};

export const getWeeklyReport = async (params = {}) => {
  const { data } = await axios.get('/api/reports/weekly', { params });
  return data;
};

export const getMonthlyReport = async (params = {}) => {
  const { data } = await axios.get('/api/reports/monthly', { params });
  return data;
};

export const exportCSV = async (params = {}) => {
  const { data } = await axios.get('/api/reports/export/csv', { params, responseType: 'blob' });
  return data;
};
