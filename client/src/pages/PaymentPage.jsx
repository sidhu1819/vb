import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Upload, QrCode, Smartphone, Copy, Check, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PaymentPage = () => {
    console.log("Payment Page Loaded");
    const location = useLocation();
    const navigate = useNavigate();
    const { service, milestoneData } = location.state || {};

    const [upiData, setUpiData] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!service || !milestoneData) {
            toast.error("Invalid payment access. Redirecting...");
            navigate('/dashboard/client/services');
            return;
        }

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

        fetchPaymentInfo();
    }, [service, milestoneData, navigate]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a payment screenshot');
        if (!transactionId.trim()) return toast.error('Transaction ID is required');
        
        setUploading(true);
        console.log("Submitting Payment Details to API...");
        
        const legacyData = new FormData();
        legacyData.append('proof', file); 
        legacyData.append('transactionId', transactionId);
        legacyData.append('service_id', service._id);
        legacyData.append('milestone', milestoneData.milestone);

        try {
            await api.post('/payments/upload-proof', legacyData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("API Response: Payment Details Submitted Successfully");
            setSuccess(true);
            toast.success("Payment proof submitted successfully!");
            
            setTimeout(() => {
                navigate(`/dashboard/client/services/${service._id}`);
            }, 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to subit payment proof');
            console.error("Payment Submission Error:", err);
        } finally {
            setUploading(false);
        }
    };

    const copyUpi = () => {
        if (!upiData) return;
        navigator.clipboard.writeText(upiData.upi_id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('UPI ID Copied');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#04060f] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#00c6ff] animate-spin" />
        </div>
    );

    if (success) return (
        <div className="min-h-screen bg-[#04060f] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center text-white backdrop-blur-xl">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Submission Successful!</h2>
                <p className="text-gray-400 mb-8">M Siddhartha Reddy will verify your payment details shortly. Redirecting you back to your project...</p>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-full bg-green-500" />
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#04060f] text-white p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Project
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Payment Instructions */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Secure Payment</h1>
                            <p className="text-gray-400">Complete the payment using UPI to unlock your next milestone.</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                            <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">{milestoneData.label}</p>
                                    <h3 className="text-5xl font-bold text-white">₹{Math.round(milestoneData.amount_inr || (milestoneData.amount_usd * upiData.usd_to_inr)).toLocaleString()}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">USD Reference</p>
                                    <p className="text-lg font-medium text-gray-300">${milestoneData.amount_usd}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-[#00c6ff]/10 flex items-center justify-center font-bold text-[#00c6ff] border border-[#00c6ff]/20">1</div>
                                        <p>Scan QR with any UPI app</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-[#00c6ff]/10 flex items-center justify-center font-bold text-[#00c6ff] border border-[#00c6ff]/20">2</div>
                                        <p>Pay the exact amount shown</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-[#00c6ff]/10 flex items-center justify-center font-bold text-[#00c6ff] border border-[#00c6ff]/20">3</div>
                                        <p>Save payment screenshot</p>
                                    </div>

                                    <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Manual UPI Address</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-mono text-[#00c6ff]">{upiData.upi_id}</span>
                                            <button onClick={copyUpi} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] p-6 shadow-[0_0_50px_rgba(0,198,255,0.15)] flex flex-col items-center">
                                    <img src={qrCode} alt="UPI QR" className="w-48 h-48" />
                                    <div className="mt-4 flex items-center gap-2 text-[#04060f] font-bold text-[10px] uppercase tracking-widest">
                                        <Smartphone size={14} /> BHIM / GPay / PhonePe
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#00c6ff]/5 border border-[#00c6ff]/10 rounded-2xl p-6 flex gap-4 text-sm text-gray-400">
                            <Lock className="text-[#00c6ff] shrink-0" />
                            <p>All payments are securely handled. Your access link will be automatically unlocked post-verification.</p>
                        </div>
                    </div>

                    {/* Right: Submission Form */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <QrCode size={120} />
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-8">Submission Details</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Transaction ID (Ref No.)</label>
                                <input 
                                    required
                                    type="text" 
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter 12-digit UPI Ref No."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] text-white transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Payment Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input 
                                        required
                                        type="date" 
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#00c6ff] text-white transition-all appearance-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Upload Receipt Screenshot</label>
                                <div className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all ${preview ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-[#00c6ff]/50 bg-white/[0.02]'}`}>
                                    {preview ? (
                                        <div className="relative w-full max-w-[200px] aspect-square rounded-2xl overflow-hidden group shadow-2xl">
                                            <img src={preview} alt="Receipt" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => {setFile(null); setPreview('');}}
                                                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Change Image
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center">
                                            <div className="w-16 h-16 bg-[#00c6ff]/10 rounded-2xl flex items-center justify-center text-[#00c6ff] mb-4">
                                                <Upload size={32} />
                                            </div>
                                            <p className="text-white font-bold mb-1 text-center">Click to Drop Receipt</p>
                                            <p className="text-gray-500 text-xs text-center">JPG, PNG up to 5MB</p>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button 
                                disabled={uploading || !file}
                                className="w-full bg-[#00c6ff] text-[#04060f] font-bold py-4 rounded-xl hover:shadow-[0_10px_30px_rgba(0,198,255,0.3)] transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {uploading ? <Loader2 className="animate-spin" /> : <>Complete Payment <CheckCircle2 size={22} /></>}
                            </button>
                            
                            <p className="text-center text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-6">Secure Manual Gateway Verification</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
