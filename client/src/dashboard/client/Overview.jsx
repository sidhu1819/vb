import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, MessageSquare, Clock, CheckCircle, Bell, Briefcase } from 'lucide-react';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  </div>
);

const Overview = () => {
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0, messagesCount: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/client/dashboard'),
          api.get('/client/notifications')
        ]);
        setStats(statsRes.data.stats);
        setNotifications(notifRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/client/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;

  return (
    <>
      <Topbar title="Overview" unreadCount={unreadCount} onNotificationClick={() => setShowNotifications(!showNotifications)} />
      
      <div className="p-8 max-w-7xl mx-auto w-full relative">
        {showNotifications && (
          <div className="absolute right-8 top-0 w-80 max-h-[80vh] bg-[#1a1f36] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-y-auto p-4">
            <h3 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">Notifications</h3>
            {notifications.length === 0 ? <p className="text-gray-400 text-sm">No notifications</p> : 
              notifications.map(n => (
                <div key={n._id} onClick={() => { if(!n.read) handleMarkRead(n._id) }} className={`p-3 rounded-lg mb-2 cursor-pointer ${n.read ? 'bg-white/5 opacity-70' : 'bg-white/10 border-l-2 border-[#00c6ff]'}`}>
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                </div>
              ))
            }
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Active Services" value={stats.active} icon={PlusCircle} color="bg-[#00c6ff]/20" />
          <StatCard title="Pending Review" value={stats.pending} icon={Clock} color="bg-amber-500/20" />
          <StatCard title="Verifying Payments" value={stats.verifying || 0} icon={Clock} color="bg-amber-500/10" />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="bg-green-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link to="/dashboard/client/services?new=true" className="group p-6 bg-gradient-to-br from-[#00c6ff]/10 to-transparent border border-[#00c6ff]/30 rounded-2xl hover:bg-[#00c6ff]/20 transition-all flex flex-col items-center justify-center text-center h-48">
                <div className="w-12 h-12 bg-[#00c6ff]/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircle className="text-[#00c6ff]" size={24} />
                </div>
                <h3 className="font-bold text-lg text-white">Request New Service</h3>
                <p className="text-sm text-gray-400 mt-1">Start a new project with us</p>
              </Link>

              <Link to="/dashboard/client/services" className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all flex flex-col items-center justify-center text-center h-48">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="text-gray-300" size={24} />
                </div>
                <h3 className="font-bold text-lg text-white">View All Services</h3>
                <p className="text-sm text-gray-400 mt-1">Manage your active projects</p>
              </Link>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">Recent Activity</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Account Created</p>
                <p className="text-xs text-gray-400">Welcome to VB Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
