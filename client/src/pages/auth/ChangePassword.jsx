import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least 1 uppercase letter required')
    .regex(/[0-9]/, 'At least 1 number required')
    .regex(/[^A-Za-z0-9]/, 'At least 1 special character required'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password cannot be the same as current",
  path: ["newPassword"]
});

const PasswordStrength = ({ password }) => {
  let score = 0;
  if (!password) return null;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Strong', 'Very Strong'];
  const activeScore = Math.max(0, Math.min(score - 1, 3));

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`flex-1 rounded-full ${i <= activeScore ? colors[activeScore] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${colors[activeScore].replace('bg-', 'text-')}`}>{labels[activeScore]}</p>
    </div>
  );
};

const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password set successfully!');
      navigate(`/dashboard/${user?.role || 'client'}`, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <AuthLayout title="Set Your Password" subtitle="You're logging in for the first time. Please set a secure password to continue.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Password / Temp Password</label>
          <div className="relative">
            <input 
              {...register('currentPassword')} 
              type={showCurrent ? 'text' : 'password'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] transition-colors pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
          <div className="relative">
            <input 
              {...register('newPassword')} 
              type={showNew ? 'text' : 'password'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] transition-colors pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrength password={newPassword} />
          {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
           <input 
              {...register('confirmPassword')} 
              type={showNew ? 'text' : 'password'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] transition-colors"
           />
           {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-[#00c6ff] text-[#04060f] font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#00c6ff50] transition-all disabled:opacity-70 mt-4 flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Password & Continue →'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ChangePassword;
