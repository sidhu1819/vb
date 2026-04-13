import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3, 
  message: 'Too many OTP resend attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
