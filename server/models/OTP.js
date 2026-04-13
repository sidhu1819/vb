import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ['login', 'verify-email', 'reset-password'], required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('OTP', otpSchema);
