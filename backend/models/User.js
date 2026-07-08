import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const COLORS = ['#2f6fdb','#0d7d7d','#6d54d6','#c2790a','#15935f','#d4453e','#0ea5b7','#4f6d8e'];

const userSchema = new mongoose.Schema({
  // Name
  firstName:    { type: String, default: '' },
  lastName:     { type: String, default: '' },
  name:         { type: String, default: '' },

  // Auth
  email:        { type: String, required: true, lowercase: true },
  password:     { type: String, required: true, select: false },
  employeeCode: { type: String, default: '' },

  // Work
  role:      { type: String, enum: ['admin','manager','hr','lead','employee','guest'], default: 'employee' },
  companyId: { type: String, required: true },
  title:     { type: String, default: '' },
  dept:      { type: String, default: '' },
  team:      { type: String, default: '' },
  empType:   { type: String, enum: ['Full-time','Part-time','Contract','Intern'], default: 'Full-time' },
  status:    { type: String, default: 'Active' },
  startDate: { type: String, default: '' },
  location:  { type: String, default: '' },

  // Contact
  phone: { type: String, default: '' },

  // Address
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    zip:     { type: String, default: '' },
    country: { type: String, default: '' },
  },

  // Emergency contact
  emergencyName:     { type: String, default: '' },
  emergencyPhone:    { type: String, default: '' },
  emergencyRelation: { type: String, default: '' },

  // Notes
  notes: { type: String, default: '' },

  // Avatar
  initials: { type: String },
  color:    { type: String },
}, { timestamps: true });

userSchema.index({ email: 1, companyId: 1 }, { unique: true });
// sparse so empty employeeCode strings don't conflict
userSchema.index({ employeeCode: 1, companyId: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Auto-compute full name
  if (this.firstName || this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }

  // Initials from name
  if (!this.initials && this.name) {
    const parts = this.name.trim().split(/\s+/);
    this.initials = (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  if (!this.color && this.name) {
    this.color = COLORS[this.name.length % COLORS.length];
  }

  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
