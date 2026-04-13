import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Loader2, Save, MessageSquare } from 'lucide-react';
import { Topbar } from '../../components/dashboard/Topbar';
import { StatusBadge } from '../client/MyServices';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PaymentTimeline } from '../../components/payment/PaymentTimeline';

const AdminServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const messagesEndRef = useRef(null);

  const fetchService = async () => {
    try {
      const res = await api.get(`/admin/services/${id}`);
      setService(res.data);
      setStatus(res.data.status);
    } catch (err) {
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [service?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/admin/services/${id}/message`, { text: message });
      setService(res.data);
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      const res = await api.put(`/admin/services/${id}/status`, { status: newStatus });
      setService(res.data);
      toast.success('Status updated');
    } catch(err) {
      toast.error('Failed to update status');
      setStatus(service.status);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>;
  if (!service) return <div className="p-12 text-center text-gray-400">Service not found.</div>;

  return (
    <>
      <Topbar title="Admin Service Detail" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden">
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <Link to="/dashboard/admin/services" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft size={16} /> Back to Pipeline
          </Link>
          
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-gray-400">Update Status:</span>
             <select value={status} onChange={handleStatusChange} className="bg-[#1a1f36] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#00c6ff]">
               <option value="pending">Pending</option>
               <option value="in-review">Reviewing</option>
               <option value="in-progress">In Progress</option>
               <option value="review">Final Review</option>
               <option value="completed">Completed</option>
               <option value="cancelled">Cancelled</option>
             </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0 pb-4">
          
          <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 pb-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{service.title}</h2>
                <StatusBadge status={service.status} />
              </div>
              <p className="text-sm border border-white/10 bg-white/5 rounded px-2.5 py-1 inline-block text-gray-300 mb-6">{service.serviceType}</p>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Client Information</p>
                  <p className="text-white font-medium">{service.clientId?.name}</p>
                  <p className="text-gray-400">{service.clientId?.email}</p>
                  {service.clientId?.company && <p className="text-gray-400">{service.clientId?.company}</p>}
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{service.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Budget</p>
                    <p className="text-white font-medium">${service.budget}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Timeline</p>
                    <p className="text-white font-medium">
                      {service.startDate ? `${new Date(service.startDate).toLocaleDateString()} to ${new Date(service.endDate).toLocaleDateString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <PaymentTimeline service={service} />
          </div>

          <div className="lg:col-span-2 bg-[#1a1f36] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-[#1a1f36] flex-shrink-0">
              <h3 className="font-bold">Project Discussion</h3>
              <p className="text-xs text-gray-400">Communicate directly with the client.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {service.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                  <p>Send a message to start the discussion.</p>
                </div>
              ) : (
                service.messages.map((msg, i) => {
                  const isAdmin = msg.sender === user._id; 
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isAdmin ? 'bg-[#00c6ff] text-[#04060f] rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-[#04060f]/60 text-right' : 'text-gray-400 text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#1a1f36] border-t border-white/10 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button type="button" className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Paperclip size={20} />
                </button>
                <input 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the client..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]"
                />
                <button type="submit" disabled={sending || !message.trim()} className="p-3 bg-[#00c6ff] text-[#04060f] rounded-xl hover:shadow-[0_0_15px_#00c6ff50] transition-shadow disabled:opacity-50 disabled:shadow-none flex items-center justify-center w-12 h-12">
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminServiceDetail;
