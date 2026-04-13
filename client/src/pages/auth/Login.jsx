import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });



  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      
      const token = res.data.accessToken;
      localStorage.setItem("token", token);
      console.log('Login successful:', res.data.user);
      
      login(res.data.user, token);

      if (res.data.mustChangePassword) {
        navigate('/auth/change-password', { replace: true });
      } else {
        const userRole = res.data.user.role;
        toast.success(`Welcome back, ${res.data.user.name}!`);
        
        if (userRole === 'founder' || userRole === 'employee') {
          console.log(`[Login] Navigating ${userRole} to /dashboard/admin`);
          navigate('/dashboard/admin', { replace: true });
        } else {
          console.log(`[Login] Navigating ${userRole} to /dashboard/client`);
          navigate('/dashboard/client', { replace: true });
        }
      }
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        toast.error(error.response.data.message);
        navigate('/auth/verify-otp', { 
          state: { userId: error.response.data.userId, purpose: 'verify-email', email: data.email } 
        });
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your dashboard to manage your projects.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input 
            {...register('email')} 
            className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] transition-colors`}
            placeholder="you@company.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <Link to="/auth/forgot-password" className="text-sm text-[#00c6ff] hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input 
              {...register('password')} 
              type={showPassword ? 'text' : 'password'}
              className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff] transition-colors pr-10`}
              placeholder="••••••••"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button 
          disabled={isSubmitting}
          className="w-full bg-[#00c6ff] text-[#04060f] font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#00c6ff50] transition-all disabled:opacity-70 flex justify-center items-center disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue →'}
        </button>
        

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link to="/auth/register" className="text-white hover:text-[#00c6ff] transition-colors">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
