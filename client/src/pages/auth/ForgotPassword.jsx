import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const emailSchema = z.object({
  email: z.string().email('Valid email is required'),
});

const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrs, isSubmitting: isSubmittingEmail } } = useForm({
    resolver: zodResolver(emailSchema)
  });

  const onEmailSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-[#04060f] flex items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[#7b5ea7]/10 blur-[120px] rounded-full poiner-events-none -z-10" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#7b5ea7]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#7b5ea7]/30 shadow-[0_0_15px_#7b5ea730]">
            <KeyRound className="w-8 h-8 text-[#7b5ea7]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Password Reset</h1>
          <p className="text-gray-400">
            {!isSuccess ? "Enter your email to receive a reset link." : "Check your inbox for the reset link."}
          </p>
        </div>

        {!isSuccess ? (
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
              {isSubmittingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-gray-300">We've sent a password reset link to your email. Click the link to securely reset your password.</p>
          </div>
        )}

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <Link to="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">Back to log in</Link>
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
