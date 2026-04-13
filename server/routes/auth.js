import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateOTP, hashOTP, verifyOTP } from '../utils/generateOTP.js';
import { generateTokens } from '../utils/generateTokens.js';
import { sendOTPEmail, sendWelcomeEmail, sendEmail } from '../utils/sendEmail.js';
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
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);
    
    await OTP.updateMany({ userId: user._id, purpose: 'reset-password', used: false }, { used: true });

    await OTP.create({
      userId: user._id,
      email: user.email,
      code: hashedToken, // Storing hashed token for security
      purpose: 'reset-password',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}?email=${encodeURIComponent(user.email)}`;
    
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #00c6ff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, 'Password Reset Request', htmlContent);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const otpRecord = await OTP.findOne({ email, purpose: 'reset-password', used: false }).sort({ createdAt: -1 });
    
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
       return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    
    const isValid = await bcrypt.compare(token, otpRecord.code);
    if (!isValid) return res.status(400).json({ message: 'Invalid token' });

    otpRecord.used = true;
    await otpRecord.save();

    const user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
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
