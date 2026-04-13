import { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import { Loader2, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${color} opacity-20 blur-2xl pointer-events-none`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <h3 className="text-gray-400 text-sm">{title}</h3>
    <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
    {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
  </div>
);

const RevenueAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRev = async () => {
      try {
        const res = await api.get('/admin/payments/revenue');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load revenue analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchRev();
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>;
  if (!data) return null;

  return (
    <>
      <Topbar title="Revenue Analytics" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Revenue (INR)" 
            value={`₹${data.total_revenue_inr.toLocaleString()}`} 
            subtitle={`$${data.total_revenue_usd.toLocaleString()} USD Equivalent`}
            icon={DollarSign} 
            color="bg-green-500" 
          />
          <StatCard 
            title="This Month" 
            value={`₹${data.this_month_inr.toLocaleString()}`} 
            subtitle={data.growth_percent >= 0 ? `▲ ${data.growth_percent.toFixed(1)}% vs last month` : `▼ ${Math.abs(data.growth_percent).toFixed(1)}% vs last month`}
            icon={TrendingUp} 
            color="bg-[#00c6ff]" 
          />
          <StatCard 
            title="Pending Collections" 
            value={`₹${data.pending_payments_inr.toLocaleString()}`} 
            subtitle="Awaiting active milestone gateways"
            icon={Briefcase} 
            color="bg-amber-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-[#1a1f36] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6">6-Month Revenue Trend (INR)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.by_month.reverse()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00c6ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1f36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue_inr" stroke="#00c6ff" strokeWidth={3} fillOpacity={1} fill="url(#colorInr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1a1f36] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-6">By Service Type</h3>
            <div className="space-y-4">
              {data.by_service_type.sort((a,b)=>b.revenue_inr - a.revenue_inr).map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{s.type}</h4>
                    <p className="text-xs text-gray-500">{s.count} closed projects</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#00c6ff]">₹{(s.revenue_inr/1000).toFixed(1)}k</p>
                  </div>
                </div>
              ))}
              {data.by_service_type.length === 0 && (
                <p className="text-gray-500 text-center py-8">No closed deals yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
export default RevenueAnalytics;
