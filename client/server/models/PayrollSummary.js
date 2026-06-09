import mongoose from 'mongoose';

const payrollSummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  totalHoursWorked: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  regularHoursPay: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  totalPay: { type: Number, default: 0 },
  latePenalties: { type: Number, default: 0 },
  attendanceDeductions: { type: Number, default: 0 },
  lateDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  overtimeRate: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'calculated', 'approved', 'paid'], default: 'draft' },
  notes: { type: String },
  calculatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date }
}, {
  timestamps: true
});

payrollSummarySchema.index({ user: 1, periodStart: 1, periodEnd: 1 });
payrollSummarySchema.index({ status: 1 });

export default mongoose.model('PayrollSummary', payrollSummarySchema);
