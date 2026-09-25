import mongoose from 'mongoose';

const nileEmployeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, default: 'General' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  dateOfBirth: { type: Date },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'],
    default: 'Full-time'
  },
  monthlySalary: { type: Number, required: true, min: 0 },
  hireDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated', 'Suspended'],
    default: 'Active'
  },
  nationalId: {
    number: { type: String, required: true },
    frontImage: { type: String, default: '' },
    backImage: { type: String, default: '' }
  },
  experienceDocument: { type: String, default: '' },
  avatar: { type: String, default: '' },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

nileEmployeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.employeeCode) {
    const stamp = Date.now().toString().slice(-6);
    this.employeeCode = `NL-EMP-${stamp}`;
  }
  next();
});

nileEmployeeSchema.index({ name: 1 });
nileEmployeeSchema.index({ department: 1 });
nileEmployeeSchema.index({ status: 1 });

export default mongoose.model('NileEmployee', nileEmployeeSchema, 'nileemployees');