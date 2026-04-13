import React, { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import { Loader2, CheckCircle, XCircle, Image as ImageIcon, ExternalLink, Clock, User, Briefcase, Mail } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProofModal = ({ proof, onClose, onApprove, onReject }) => {
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await onApprove(proof.service_id, proof.milestone);
      onClose();
    } catch (e) {
      toast.error('Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reason) return toast.error('Please provide a reason for rejection');
    setProcessing(true);
    try {
      await onReject(proof.service_id, proof.milestone, reason);
      onClose();
    } catch (e) {
      toast.error('Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1f36] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Screenshot View */}
        <div className="lg:w-2/3 bg-black/40 p-4 flex items-center justify-center overflow-auto border-r border-white/10">
          <img 
            src={`${import.meta.env.VITE_API_URL}${proof.proof_image_url}`} 
            alt="Payment Proof" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Actions Sidebar */}
        <div className="lg:w-1/3 p-8 flex flex-col h-full bg-[#1a1f36]">
          <button onClick={onClose} className="self-end text-gray-400 hover:text-white p-2">
            <XCircle size={24} />
          </button>

          <div className="mt-4 flex-grow space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{proof.service_title}</h3>
              <p className="text-[#00c6ff] font-medium">Milestone {proof.milestone}: {proof.label}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <User size={16} /> <span>{proof.client_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} /> <span>{proof.client_email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Briefcase size={16} /> <span>Amount: ₹{proof.amount_inr?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#00c6ff]">
                <span>Trans ID:</span> <strong>{proof.transactionId || 'Not provided'}</strong>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Rejection Reason (Internal/Client)</label>
              <textarea 
                placeholder="Why is this proof invalid? (e.g. wrong amount, blurry image)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#04060f] border border-white/10 rounded-xl p-4 text-sm text-white resize-none h-24 focus:border-[#7b5ea7] transition-colors"
              />
            </div>
          </div>

          <div className="mt-auto pt-8 flex gap-4">
            <button 
              disabled={processing}
              onClick={handleReject}
              className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              Reject ❌
            </button>
            <button 
              disabled={processing}
              onClick={handleApprove}
              className="flex-1 bg-[#22c55e] border border-[#22c55e] text-black font-bold py-3 rounded-xl hover:bg-white hover:border-white transition-all disabled:opacity-50"
            >
              Approve ✅
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PaymentVerification = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get('/admin/payments/pending');
      setPending(res.data);
    } catch (e) {
      toast.error('Failed to load pending queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (service_id, milestone) => {
    await api.post('/admin/payments/approve', { service_id, milestone });
    toast.success('Payment verified and content unlocked!');
    fetchPending();
  };

  const handleReject = async (service_id, milestone, reason) => {
    await api.post('/admin/payments/reject', { service_id, milestone, reason });
    toast.success('Payment rejected. Client notified.');
    fetchPending();
  };

  return (
    <>
      <Topbar title="Payment Verification Queue" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Manual UPI Ledger</h2>
          <p className="text-gray-400">Approve or reject incoming payment screenshots from clients.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-[#00c6ff] animate-spin" /></div>
        ) : pending.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Queue is Clear!</h3>
            <p className="text-gray-400">All pending payments have been verified.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {pending.map((proof, i) => (
                <motion.div
                  layout
                  key={`${proof.service_id}-${proof.milestone}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-[#1a1f36] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group hover:border-[#00c6ff]/30 transition-all"
                >
                  <div className="aspect-video relative overflow-hidden bg-black/40">
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${proof.proof_image_url}`} 
                      alt="Proof Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f36] to-transparent opacity-80"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                        Milestone {proof.milestone}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{proof.service_title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{proof.client_name}</p>
                    <p className="text-xs text-[#00c6ff] font-mono mb-4 bg-[#00c6ff]/10 inline-block px-2 py-1 rounded">TransID: {proof.transactionId || 'N/A'}</p>
                    
                    <div className="flex items-center justify-between py-4 border-t border-white/5 text-sm">
                      <div className="text-white font-bold">₹{proof.amount_inr?.toLocaleString()}</div>
                      <div className="text-gray-500 flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(proof.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedProof(proof)}
                      className="w-full bg-[#00c6ff] hover:bg-white text-black font-bold py-3 rounded-xl transition-all shadow-[0_5px_15px_rgba(0,198,255,0.2)] flex items-center justify-center gap-2"
                    >
                      Verify Now <ExternalLink size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {selectedProof && (
          <ProofModal 
            proof={selectedProof} 
            onClose={() => setSelectedProof(null)} 
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </>
  );
};

export default PaymentVerification;
