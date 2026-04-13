import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, BellRing, Send, User as UserIcon } from 'lucide-react';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { clientId: 'all', type: 'info', title: '', message: '' }
  });

  const loadData = async () => {
    try {
      const [clientsRes, notifRes] = await Promise.all([
        api.get('/admin/clients'),
        api.get('/admin/notifications/all') 
      ]);
      setClients(clientsRes.data);
      setHistory(notifRes.data);
    } catch(err) {
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post(`/admin/clients/${data.clientId}/notify`, {
        title: data.title,
        message: data.message,
        type: data.type
      });
      toast.success('Notification dispatched successfully!');
      reset({ clientId: 'all', type: 'info', title: '', message: '' });
      loadData();
    } catch(err) { 
      toast.error('Failed to send notification');
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>;

  return (
    <>
      <Topbar title="Notification Center" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="lg:col-span-1">
           <form onSubmit={handleSubmit(onSubmit)} className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24 shadow-xl">
             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-3 bg-[#00c6ff]/20 rounded-xl"><BellRing className="text-[#00c6ff]" size={20} /></div>
                <h2 className="text-xl font-bold">Send Alert</h2>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1">Target Client</label>
                   <select {...register('clientId', { required: true })} className="w-full bg-[#1a1f36] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff]">
                     <option value="all">Broadcast to All Clients</option>
                     {clients.map(c => (
                       <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                     ))}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1">Notification Type</label>
                   <select {...register('type', { required: true })} className="w-full bg-[#1a1f36] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff]">
                     <option value="info">General Info</option>
                     <option value="success">Success / Resolved</option>
                     <option value="warning">Warning / Action Required</option>
                     <option value="update">Project Update</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                   <input {...register('title', { required: true })} placeholder="E.g. System Maintenance" className="w-full bg-[#1a1f36] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff]" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                   <textarea {...register('message', { required: true })} rows={4} placeholder="Type the alert content..." className="w-full bg-[#1a1f36] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00c6ff]" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#00c6ff] text-[#04060f] font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#00c6ff50] transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send size={18} /> Dispatch Notification</>}
                </button>
             </div>
           </form>
         </div>

         <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
               <div className="p-6 border-b border-white/10 bg-[#1a1f36]">
                 <h2 className="text-xl font-bold">Sent History</h2>
                 <p className="text-sm text-gray-400 mt-1">Log of all pushed platform notifications.</p>
               </div>
               <div className="divide-y divide-white/5">
                 {history.length === 0 ? (
                   <p className="p-8 text-center text-gray-500">No notifications sent yet.</p>
                 ) : (
                   history.map((n) => {
                     const colorBadge = n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'update' ? 'bg-purple-500' : 'bg-[#00c6ff]';
                     return (
                       <div key={n._id} className="p-6 hover:bg-white/5 transition-colors flex gap-4">
                         <div className={`w-2 h-2 rounded-full ${colorBadge} mt-2 shrink-0`} />
                         <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                             <h4 className="font-bold text-white text-base">{n.title}</h4>
                             <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                           <p className="text-sm text-gray-400 mb-3">{n.message}</p>
                           <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                             <UserIcon size={12} /> Sent to: {n.userId ? `${n.userId.name} (${n.userId.email})` : 'System Broadcast'}
                           </p>
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
            </div>
         </div>

      </div>
    </>
  );
};
export default AdminNotifications;
