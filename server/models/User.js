import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['client', 'employee', 'founder'], default: 'client' },
  isEmailVerified: { type: Boolean, default: false },
  isOtpEnabled: { type: Boolean, default: false },
  phone: { type: String },
  company: { type: String },
  lastLoginAt: { type: Date },
  createdByAdmin: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false },
  passwordChangedAt: { type: Date },
  activeServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
