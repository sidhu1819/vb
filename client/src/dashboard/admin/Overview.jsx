import { useState, useEffect } from 'react';
import { Users, Briefcase, Activity, DollarSign, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 shadow-xl group hover:border-[#00c6ff]/30 transition-all">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  console.log('Rendering AdminDashboard');
  const [stats, setStats] = useState({ totalClients: 0, activeServices: 0, pendingReview: 0, completed: 0, revenue: 0, pending_verifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.stats);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>;

  const chartData = [
    { name: 'Active', value: stats.activeServices, color: '#00c6ff' },
    { name: 'Queue', value: Math.max(stats.pending_verifications, 1), color: '#f59e0b' },
    { name: 'Completed', value: Math.max(stats.completed, 1), color: '#10b981' }
  ];

  return (
    <>
      <Topbar title="Admin Overview" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Revenue (INR)" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500/20" />
          <StatCard title="Pending Proofs" value={stats.pending_verifications} icon={ShieldCheck} color="bg-amber-500/20" />
          <StatCard title="Active Pipeline" value={stats.activeServices} icon={Activity} color="bg-[#00c6ff]/20" />
          <StatCard title="Active Clients" value={stats.totalClients} icon={Users} color="bg-[#7b5ea7]/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Pipeline Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1a1f36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Sparkles size={120} className="text-[#00c6ff]" />
             </div>
             <h3 className="text-xl font-bold mb-6">Platform Actions</h3>
             <ul className="space-y-4">
               <li className="flex items-center justify-between p-4 bg-[#1a1f36] rounded-xl border border-white/5">
                 <span className="text-sm font-medium">New Clients this month</span>
                 <span className="text-[#00c6ff] font-bold">+{stats.totalClients}</span>
               </li>
               <li className="flex items-center justify-between p-4 bg-[#1a1f36] rounded-xl border border-white/5">
                 <span className="text-sm font-medium">Service Requests Conversion</span>
                 <span className="text-green-500 font-bold">85%</span>
               </li>
             </ul>
          </div>
        </div>

      </div>
    </>
  );
};
export default AdminDashboard;
