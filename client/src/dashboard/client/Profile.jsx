import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Topbar } from '../../components/dashboard/Topbar';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
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
    <div className="mt-2 text-left">
      <div className="flex gap-1 h-1.5 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`flex-1 rounded-full ${i <= activeScore ? colors[activeScore] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-xs ${colors[activeScore].replace('bg-', 'text-')}`}>{labels[activeScore]}</p>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    try {
      await api.put('/client/profile', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <>
      <Topbar title="My Profile" />
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-8">
        
        {/* Section 1 - Account Information (Read Only) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Account Information</h3>
          
          <div className="border border-white/10 rounded-xl p-6 bg-black/20">
            <p className="text-lg text-white mb-2 font-medium flex items-center gap-2">
              👤 {user?.name}
            </p>
            <p className="text-gray-400 mb-2 flex items-center gap-2">
              📧 {user?.email}
            </p>
            {user?.company && (
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                🏢 {user.company}
              </p>
            )}
            {user?.phone && (
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                📱 {user.phone}
              </p>
            )}
            <p className="text-gray-400 mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm">
              📅 Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          
          <p className="text-gray-500 text-sm mt-4 italic text-center">
            To update your details, contact: <br className="sm:hidden" />
            <span className="text-white not-italic">vbsoftwaresolutions.founder@gmail.com</span>
          </p>
        </div>

        {/* Section 2 - Change Password */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Change Password</h3>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <div className="relative">
                <input 
                  {...register('currentPassword')} 
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full bg-[#1a1f36] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] pr-10"
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
                  className="w-full bg-[#1a1f36] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] pr-10"
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
                  className="w-full bg-[#1a1f36] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff]"
               />
               {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-4">
              <button disabled={isSubmitting} className="w-full px-8 py-3 bg-[#00c6ff] text-[#04060f] font-bold rounded-xl hover:shadow-[0_0_15px_#00c6ff50] transition-shadow disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password →'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </>
  );
};

export default Profile;
