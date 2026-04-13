import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { Topbar } from '../../components/dashboard/Topbar';
import { StatusBadge } from './MyServices';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { PaymentBanner } from '../../components/payment/PaymentBanner';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { DemoLinkCard } from '../../components/payment/DemoLinkCard';
import { PaymentTimeline } from '../../components/payment/PaymentTimeline';
import { BackButton } from '../../components/shared/BackButton';

const steps = ['Pending', 'In Review', 'In Progress', 'Final Review', 'Completed'];
const stepMapping = {
  'pending': 0,
  'in-review': 1,
  'in-progress': 2,
  'review': 3,
  'completed': 4,
  'cancelled': -1
};

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchService = async () => {
    try {
      const res = await api.get(`/client/services/${id}`);
      setService(res.data);
    } catch (err) {
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
    // Setting up a basic interval for "real-time" feel without WebSockets for now
    const int = setInterval(fetchService, 10000); 
    return () => clearInterval(int);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [service?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/client/services/${id}/message`, { text: message });
      setService(res.data);
      setMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>;
  if (!service) return <div className="p-12 text-center text-gray-400">Service not found.</div>;

  const currentStep = stepMapping[service.status];
  
  // Find the next milestone that needs action (either pending or rejected)
  const awaitingPayment = service.milestonePayments?.find(p => p.status === 'pending' || p.status === 'rejected');
  
  // Check if there's any payment currently being verified
  const verificationPending = service.milestonePayments?.find(p => p.status === 'uploaded');

  const kickoffPayment = service.milestonePayments?.find(p => p.milestone === 1);
  const isDemoLocked = !service.demo_unlocked;

  return (
    <>
      <Topbar title="Service Details" />
      {verificationPending ? (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex items-center justify-center gap-3 text-amber-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-amber-500/5 animate-pulse"></div>
          <Loader2 size={18} className="animate-spin relative z-10" />
          <span className="font-bold relative z-10">Verification Pending: Milestone {verificationPending.milestone} proof is being reviewed by M Siddhartha Reddy.</span>
        </div>
      ) : awaitingPayment ? (
        <PaymentBanner 
          milestone={awaitingPayment.milestone}
          amountUsd={awaitingPayment.amount_usd}
          amountInr={awaitingPayment.amount_inr}
          status={awaitingPayment.status}
          onPayClick={() => setIsPaymentModalOpen(true)}
          service={service}
        />
      ) : null}
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col h-[calc(100vh-80px)] overflow-hidden">
        <div className="mb-6 flex-shrink-0">
          <BackButton label="Back to My Services" to="/dashboard/client/services" />
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
                  <p className="text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{service.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 mb-1">Estimated Budget</p>
                    <p className="text-white font-medium">{service.budget}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Timeline</p>
                    <p className="text-white font-medium">{service.timeline}</p>
                  </div>
                </div>
              </div>
            </div>

            {service.demo_link && (
              <DemoLinkCard demoLink={service.demo_link} isLocked={isDemoLocked} />
            )}

            <PaymentTimeline service={service} />
            
          </div>

          <div className="lg:col-span-2 bg-[#1a1f36] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-[#1a1f36] flex-shrink-0">
              <h3 className="font-bold">Project Discussion</h3>
              <p className="text-xs text-gray-400">Communicate directly with the VB Solutions team.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {service.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                  <p>Send a message to start the discussion.</p>
                </div>
              ) : (
                service.messages.map((msg, i) => {
                  const isClient = msg.sender === user._id;
                  return (
                    <div key={i} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isClient ? 'bg-[#00c6ff] text-[#04060f] rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isClient ? 'text-[#04060f]/60 text-right' : 'text-gray-400 text-left'}`}>
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
                  placeholder="Type your message..."
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

      {awaitingPayment && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)}
          service={service}
          milestoneData={awaitingPayment}
          onSuccess={fetchService}
        />
      )}
    </>
  );
};

export default ServiceDetail;
