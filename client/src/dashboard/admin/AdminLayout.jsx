import { Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BellRing, CreditCard, BarChart2, Loader2, ShieldCheck } from 'lucide-react';
import { Sidebar } from '../../components/dashboard/Sidebar';
import { useAuth } from '../../context/AuthContext';

const links = [
  { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/admin/services', label: 'Pipeline', icon: Briefcase },
  { path: '/dashboard/admin/verifications', label: 'Verifications', icon: ShieldCheck },
  { path: '/dashboard/admin/revenue', label: 'Revenue', icon: BarChart2 },
  { path: '/dashboard/admin/transactions', label: 'Ledger', icon: CreditCard },
  { path: '/dashboard/admin/clients', label: 'Clients', icon: Users },
  { path: '/dashboard/admin/notifications', label: 'Alerts', icon: BellRing }
];

const AdminLayout = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#04060f]"><Loader2 className="w-10 h-10 text-[#00c6ff] animate-spin" /></div>;
  if (!user || (user.role !== 'founder' && user.role !== 'employee')) {
    console.log('[AdminLayout] Denied access for role:', user?.role);
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#04060f] flex text-white">
      <Sidebar links={links} user={user} onLogout={logout} />
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
export default AdminLayout;
