import { Rocket, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentBanner = ({ milestone, amountUsd, amountInr, status, onPayClick, service }) => {
  const navigate = useNavigate();
  
  const handlePay = () => {
    if (onPayClick) return onPayClick();
    console.log("[PaymentBanner] Navigating to /payment");
    navigate('/dashboard/client/payment', { 
      state: { 
        service, 
        milestoneData: { milestone, amountUsd, amountInr, status, label: milestone === 1 ? 'Milestone 1' : 'Milestone 2' } 
      } 
    });
  };

  const isMilestone1 = milestone === 1;
  const isRejected = status === 'rejected';

  if (isRejected) {
    return (
      <div className="w-full bg-red-500/10 border-b border-red-500/30 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Payment Rejected ❌</h3>
            <p className="text-sm text-gray-300">
              Your previous proof for ₹{amountInr?.toLocaleString('en-IN')} was rejected. Please re-upload a clear screenshot of the transaction.
            </p>
          </div>
        </div>
        <button 
          onClick={handlePay}
          className="w-full md:w-auto px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all whitespace-nowrap"
        >
          Re-upload Proof &rarr;
        </button>
      </div>
    );
  }

  if (isMilestone1) {
    return (
      <div className="w-full bg-gradient-to-r from-[#00c6ff]/20 to-transparent border-b border-[#00c6ff]/30 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00c6ff]/20 rounded-full flex items-center justify-center shrink-0">
            <Rocket className="text-[#00c6ff]" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Your project is in progress!</h3>
            <p className="text-sm text-gray-300">
              Pay ₹{amountInr?.toLocaleString('en-IN')} (Milestone 1) to unlock your demo link and move forward.
            </p>
          </div>
        </div>
        <button 
          onClick={handlePay}
          className="w-full md:w-auto px-8 py-3 bg-[#00c6ff] text-[#04060f] font-bold rounded-lg hover:shadow-[0_0_20px_#00c6ff60] transition-all whitespace-nowrap"
        >
          Pay Milestone 1 &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-green-500/20 to-transparent border-b border-green-500/30 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="text-green-500" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">Your project is ready!</h3>
          <p className="text-sm text-gray-300">
            Pay final ₹{amountInr?.toLocaleString('en-IN')} (Milestone 2) to get your handover files.
          </p>
        </div>
      </div>
      <button 
        onClick={handlePay}
        className="w-full md:w-auto px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all whitespace-nowrap"
      >
        Pay Final Amount &rarr;
      </button>
    </div>
  );
};
