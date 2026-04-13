import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle2, Upload, QrCode, Smartphone, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const PaymentModal = ({ isOpen, onClose, service, milestoneData, onSuccess }) => {
  const [upiData, setUpiData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1); // 1: Pay, 2: Upload
  const [successMode, setSuccessMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPaymentInfo = async () => {
    try {
      const infoRes = await api.get('/payments/info');
      setUpiData(infoRes.data);
      
      const amount = milestoneData.amount_inr || (milestoneData.amount_usd * infoRes.data.usd_to_inr);
      const qrRes = await api.get(`/payments/upi-qr?amount=${Math.round(amount)}&note=Invoice_${milestoneData.milestone}_${service.title.substring(0, 10)}`);
      setQrCode(qrRes.data.qrCode);
    } catch (error) {
      toast.error('Failed to load payment info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPaymentInfo();
      setStep(1);
      setSuccessMode(false);
      setFile(null);
      setTransactionId('');
      setPreview('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a payment screenshot');
    if (!transactionId.trim()) return toast.error('Transaction ID is required');
    setUploading(true);
    
    const legacyData = new FormData();
    legacyData.append('proof', file);
    legacyData.append('transactionId', transactionId);
    legacyData.append('service_id', service._id);
    legacyData.append('milestone', milestoneData.milestone);

    try {
      await api.post('/payments/upload-proof', legacyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMode(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiData?.upi_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID Copied');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#1a1f36] border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
        >
          {successMode ? (
            <div className="p-12 text-center">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.2)]"
              >
                <CheckCircle2 size={48} className="text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Proof Uploaded!</h2>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">M Siddhartha Reddy will verify your payment shortly. You'll receive an email once it's approved.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-400">
                <Lock size={12} /> Milestone tracking enabled
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-white">{milestoneData.label}</h2>
                  <p className="text-[#00c6ff] text-sm font-medium">Step {step}: {step === 1 ? 'Scan & Pay' : 'Upload Proof'}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">
                {step === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="bg-[#00c6ff]/5 border border-[#00c6ff]/20 rounded-2xl p-6">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Payable Amount</p>
                        <h3 className="text-4xl font-bold text-white">₹{Math.round(milestoneData.amount_inr || (milestoneData.amount_usd * (upiData?.usd_to_inr || 84))).toLocaleString()}</h3>
                        <p className="text-xs text-gray-500 mt-2">≈ ${milestoneData.amount_usd} USD (@ ₹{upiData?.usd_to_inr || 84})</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#00c6ff]">1</div>
                          <p>Scan the QR on the right</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#00c6ff]">2</div>
                          <p>Complete payment in any UPI app</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 border-b border-white/5 pb-4">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#00c6ff]">3</div>
                          <p>Take a screenshot of the receipt</p>
                        </div>

                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Manual UPI ID</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-gray-300">{upiData?.upi_id}</span>
                            <button onClick={copyUpi} className="text-[#00c6ff] hover:text-white transition-colors">
                              {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-[0_0_50px_rgba(0,198,255,0.1)] flex flex-col items-center">
                      {loading ? (
                        <div className="w-48 h-48 flex items-center justify-center"><RefreshCw className="animate-spin text-gray-400" /></div>
                      ) : (
                        <>
                          <img src={qrCode} alt="UPI QR" className="w-48 h-48" />
                          <div className="mt-4 flex items-center gap-2 text-[#04060f] font-bold text-xs uppercase tracking-wider">
                            <Smartphone size={14} /> Scan with Phone
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:border-[#00c6ff]/50 bg-white/[0.02]">
                      {preview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                          <img src={preview} alt="Screenshot Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {setFile(null); setPreview('');}}
                            className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center">
                          <div className="w-16 h-16 bg-[#00c6ff]/10 rounded-2xl flex items-center justify-center text-[#00c6ff] mb-4">
                            <Upload size={32} />
                          </div>
                          <p className="text-white font-bold mb-1">Click to Upload Screenshot</p>
                          <p className="text-gray-500 text-xs text-center px-4 leading-relaxed">Ensure the Transaction ID and Amount are clearly visible in the receipt.</p>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      )}
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">Transaction ID (Required)</label>
                      <input 
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. T2304031548"
                        className="w-full bg-[#04060f] border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#00c6ff] text-white transition-colors"
                      />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4 text-xs text-amber-500 leading-relaxed">
                      <Lock size={16} className="shrink-0" />
                      <p>Full project handover automatically unlocks once M Siddhartha Reddy verifies your payment screenshot. This typically takes 2-4 hours.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 pt-0">
                {step === 1 ? (
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-[#00c6ff] text-[#04060f] font-bold text-lg rounded-2xl hover:shadow-[0_10px_30px_rgba(0,198,255,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    I Have Paid, Next Step <Lock size={18} />
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="flex-[2] py-4 bg-[#22c55e] text-black font-bold text-lg rounded-2xl hover:shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? <RefreshCw className="animate-spin" /> : 'Confirm & Upload Proof'}
                    </button>
                  </div>
                )}
                <p className="text-center text-[10px] text-gray-500 mt-6 uppercase tracking-widest font-bold">Manual UPI Gateway • VB Software Solutions</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

