import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { KeyRound, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

const pwdSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(pwdSchema)
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword: data.password
      });
      toast.success('Password reset successfully. You can now log in.');
      navigate('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Link might be invalid or expired.');
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
          <h1 className="text-3xl font-bold text-white mb-2">Create New Password</h1>
          <p className="text-gray-400">Set your new password for {email}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input 
              type="password"
              {...register('password')} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7b5ea7] transition-colors"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input 
              type="password"
              {...register('confirmPassword')} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7b5ea7] transition-colors"
            />
             {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button disabled={isSubmitting} className="w-full bg-[#7b5ea7] text-white font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#7b5ea750] transition-all disabled:opacity-70 flex justify-center items-center mt-6">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <Link to="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">Back to log in</Link>
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPassword;
