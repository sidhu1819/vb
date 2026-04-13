import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { OTPInput } from '../../components/auth/OTPInput';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const state = location.state || {};
  const { userId, email, purpose } = state;

  const [timer, setTimer] = useState(300); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!userId || !email) {
      navigate('/auth/login');
    }
  }, [userId, email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/resend-otp', { userId, purpose });
      setTimer(300);
      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleOTPComplete = async (code) => {
    setIsVerifying(true);
    try {
      const endpoint = purpose === 'login' ? '/auth/verify-login-otp' : '/auth/verify-email';
      const res = await api.post(endpoint, { userId, otp: code });
      
      setSuccess(true);
      login(res.data.user, res.data.accessToken);
      
      setTimeout(() => {
        navigate(`/dashboard/${res.data.user.role}`, { replace: true });
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect code');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060f] flex items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[#00c6ff]/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden"
      >
        {!success ? (
          <>
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 bg-[#00c6ff]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00c6ff]/30 shadow-[0_0_15px_#00c6ff30]"
            >
              <Mail className="w-8 h-8 text-[#00c6ff]" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-gray-400 mb-8">We sent a 6-digit code to <span className="text-white font-medium">{email}</span></p>

            {isVerifying ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#00c6ff] animate-spin mb-4" />
                <p className="text-gray-400">Verifying code...</p>
              </div>
            ) : (
              <OTPInput onComplete={handleOTPComplete} />
            )}

            <div className="mt-8 text-sm">
              {timer > 0 ? (
                <p className="text-gray-500">Resend code in <span className="font-mono text-white">{formatTime(timer)}</span></p>
              ) : (
                <button onClick={handleResend} className="text-[#00c6ff] hover:underline font-medium">Resend Code</button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <Link to="/auth/login" className="text-sm text-gray-400 hover:text-white transition-colors">Wrong email? Go back</Link>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="py-12 flex flex-col items-center justify-center"
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verified Successfully!</h2>
            <p className="text-gray-400">Redirecting to your dashboard...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
