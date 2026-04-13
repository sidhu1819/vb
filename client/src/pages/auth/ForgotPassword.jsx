import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, KeyRound } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { OTPInput } from '../../components/auth/OTPInput';
import { motion } from 'framer-motion';

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

const passwordSchema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrs, isSubmitting: isSubmittingEmail } } = useForm({
    resolver: zodResolver(emailSchema)
  });

  const { register: registerPwd, handleSubmit: handlePwdSubmit, formState: { errors: pwdErrs, isSubmitting: isSubmittingPwd } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onEmailSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setUserId(res.data.userId);
      setStep(2);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    }
  };

  const handleOTPComplete = (code) => {
    setOtp(code);
    setStep(3); 
  };

  const onPwdSubmit = async (data) => {
    try {
      await api.post('/auth/reset-password', { userId, otp, newPassword: data.password });
      toast.success('Password reset successfully. You can now log in.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. OTP might be invalid.');
      setStep(2); 
    }
  };

  return (
    <div className="min-h-screen bg-[#04060f] flex items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[#7b5ea7]/10 blur-[120px] rounded-full point-events-none -z-10" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#7b5ea7]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#7b5ea7]/30 shadow-[0_0_15px_#7b5ea730]">
            <KeyRound className="w-8 h-8 text-[#7b5ea7]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Password Reset</h1>
          <p className="text-gray-400">
            {step === 1 && "Enter your email to receive a reset code."}
            {step === 2 && `We sent a reset code to ${email}`}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
            <div>
              <input 
                {...registerEmail('email')} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7b5ea7] transition-colors"
                placeholder="you@company.com"
              />
              {emailErrs.email && <p className="text-red-500 text-sm mt-1">{emailErrs.email.message}</p>}
            </div>
            <button disabled={isSubmittingEmail} className="w-full bg-[#7b5ea7] text-white font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#7b5ea750] transition-all disabled:opacity-70 flex justify-center items-center">
              {isSubmittingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <OTPInput onComplete={handleOTPComplete} />
        )}

        {step === 3 && (
          <form onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input 
                type="password"
                {...registerPwd('password')} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7b5ea7] transition-colors"
              />
              {pwdErrs.password && <p className="text-red-500 text-sm mt-1">{pwdErrs.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
              <input 
                type="password"
                {...registerPwd('confirmPassword')} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7b5ea7] transition-colors"
              />
               {pwdErrs.confirmPassword && <p className="text-red-500 text-sm mt-1">{pwdErrs.confirmPassword.message}</p>}
            </div>
            <button disabled={isSubmittingPwd} className="w-full bg-[#7b5ea7] text-white font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#7b5ea750] transition-all disabled:opacity-70 flex justify-center items-center mt-6">
              {isSubmittingPwd ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <Link to="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">Back to log in</Link>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
