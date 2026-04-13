import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04060f] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#00c6ff] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    const hasToken = localStorage.getItem('token');
    if (hasToken) {
      return (
        <div className="min-h-screen bg-[#04060f] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#00c6ff] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role === 'admin' ? 'admin' : 'client'}`} replace />;
  }

  return <Outlet />;
};
