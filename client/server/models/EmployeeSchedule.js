import mongoose from 'mongoose';

const employeeScheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  date: { type: String, required: true },
  weekStart: { type: String, required: true, index: true },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

employeeScheduleSchema.index({ user: 1, date: 1 }, { unique: true });
employeeScheduleSchema.index({ weekStart: 1, shift: 1 });

export default mongoose.model('EmployeeSchedule', employeeScheduleSchema);
