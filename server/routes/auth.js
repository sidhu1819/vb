import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateOTP, hashOTP, verifyOTP } from '../utils/generateOTP.js';
import { generateTokens } from '../utils/generateTokens.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/sendEmail.js';
import { otpRateLimiter, resendOtpLimiter } from '../middleware/rateLimiter.js';
import { authenticateJWT } from '../middleware/authenticate.js';

const router = express.Router();

const createAndSendOTP = async (user, purpose) => {
  await OTP.updateMany({ userId: user._id, purpose, used: false }, { used: true });
  const otpCode = generateOTP();
  const hashedCode = await hashOTP(otpCode);
  await OTP.create({
    userId: user._id,
    email: user.email,
    code: hashedCode,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
  await sendOTPEmail(user.email, otpCode);
};

router.post('/register', (req, res) => {
  res.status(403).json({
    error: "Self-registration is disabled.",
    message: "Contact admin to create an account."
  });
});


router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase().trim();
    
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials or google auth user' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Safety check for unverified emails
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.', requiresVerification: true, userId: user._id });
    }

    user.lastLoginAt = new Date();
    await user.save();

    console.log("Login route hit");
    console.log("User found:", user.email);
    console.log("Password match:", isMatch);

    const tokens = generateTokens(user._id, user.role);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ 
      accessToken: tokens.accessToken, 
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      mustChangePassword: user.mustChangePassword || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/resend-otp', resendOtpLimiter, async (req, res) => {
  try {
    const { userId, purpose } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await createAndSendOTP(user, purpose);
    res.json({ message: 'New OTP sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    const tokens = generateTokens(user._id, user.role);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await createAndSendOTP(user, 'reset-password');
    res.json({ message: 'Password reset OTP sent', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const otpRecord = await OTP.findOne({ userId, purpose: 'reset-password', used: false }).sort({ createdAt: -1 });
    
    if (!otpRecord || otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'Invalid or expired OTP' });
    const isValid = await verifyOTP(otp, otpRecord.code);
    if (!isValid) return res.status(400).json({ message: 'Incorrect OTP' });

    otpRecord.used = true;
    await otpRecord.save();

    const user = await User.findById(userId);
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current.' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticateJWT, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
