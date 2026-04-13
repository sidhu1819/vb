import { Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, User as UserIcon, CreditCard, Loader2 } from 'lucide-react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { useAuth } from '../../context/AuthContext';

const links = [
  { path: '/dashboard/client', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/client/services', label: 'My Services', icon: Briefcase },
  { path: '/dashboard/client/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/dashboard/client/profile', label: 'Profile', icon: UserIcon }
];

const ClientLayout = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#04060f]"><Loader2 className="w-10 h-10 text-[#00c6ff] animate-spin" /></div>;
  if (!user || user.role !== 'client') return <Navigate to={`/auth/login`} replace />;

  return (
    <div className="min-h-screen bg-[#04060f] flex text-white">
      <Sidebar links={links} user={user} onLogout={logout} />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;
