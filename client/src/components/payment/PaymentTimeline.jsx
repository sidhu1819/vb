import { CheckCircle2, Clock, XCircle, FileWarning, AlertCircle, ShieldCheck } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';

const MilestoneRow = ({ title, percent, amountUsd, amountInr, exchangeRate, status, invoiceNumber, verifiedAt, rejectionReason }) => {
  const isApproved = status === 'approved';
  const isUploaded = status === 'uploaded';
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  
  return (
    <div className={`relative pl-8 pb-8 ${isApproved ? 'border-l-2 border-[#00c6ff]' : 'border-l-2 border-white/10'}`}>
      <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full flex items-center justify-center bg-[#1a1f36] border-2 
        ${isApproved ? 'border-[#00c6ff]' : (isUploaded ? 'border-amber-500' : (isRejected ? 'border-red-500' : 'border-gray-600'))}`}>
        {isApproved ? <CheckCircle2 className="w-3 h-3 text-[#00c6ff]" /> : 
         (isUploaded ? <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> : 
         (isRejected ? <AlertCircle className="w-3 h-3 text-red-500" /> : 
         <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />))}
      </div>
      
      <div className={`bg-white/5 border rounded-xl p-5 -mt-2 transition-all 
        ${isRejected ? 'border-red-500/30' : 'border-white/10 hover:bg-white/10'}`}>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-bold text-white text-lg flex items-center gap-2">
              {title} <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{percent}%</span>
            </h4>
            {isApproved && <p className="text-xs font-mono mt-1 text-gray-400">Invoice #{invoiceNumber}</p>}
          </div>
          <div className="text-left sm:text-right">
             <CurrencyDisplay usdAmount={amountUsd} inrAmount={amountInr} rate={exchangeRate} />
             <div className="mt-1">
               {isApproved && <span className="text-xs text-green-400 font-bold tracking-wider">VERIFIED ✓</span>}
               {isUploaded && <span className="text-xs text-amber-500 font-bold tracking-wider flex items-center gap-1">AWAITING REVIEW <Clock size={10} /></span>}
               {isRejected && <span className="text-xs text-red-500 font-bold tracking-wider">PAYMENT REJECTED</span>}
               {isPending && <span className="text-xs text-gray-500 font-bold tracking-wider">LOCKED</span>}
             </div>
          </div>
        </div>

        {isApproved && verifiedAt && (
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-white/10 pt-3 mt-1">
            <span>Verified on: {new Date(verifiedAt).toLocaleDateString()}</span>
            <span>Method: Manual (UPI)</span>
          </div>
        )}

        {isRejected && rejectionReason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3 text-xs text-red-400">
            <strong>Rejection Reason:</strong> {rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
};

export const PaymentTimeline = ({ service }) => {
  if (!service || !service.milestonePayments || service.milestonePayments.length === 0) return null;

  const totalUsd = service.total_paid_usd || 0;
  const projectValueUsd = service.budget_usd;
  
  const progressPercent = (totalUsd / projectValueUsd) * 100;

  return (
    <div className="mt-8 bg-[#1a1f36] border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Payment Timeline</h3>
          <p className="text-gray-400 text-sm">Track your milestone completion and total project value.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-gray-400 mb-1">Total Project Value</p>
          <CurrencyDisplay usdAmount={projectValueUsd} inrAmount={service.budget_inr} rate={service.exchange_rate} className="text-2xl justify-end md:justify-end" />
        </div>
      </div>

      <div className="ml-2 mt-4 max-w-2xl">
        {service.milestonePayments.map((p, i) => (
          <MilestoneRow 
            key={i}
            title={p.label || `Milestone ${p.milestone}`}
            percent={p.percent}
            amountUsd={p.amount_usd}
            amountInr={p.amount_inr}
            exchangeRate={service.exchange_rate}
            status={p.status}
            invoiceNumber={p.invoice_number}
            verifiedAt={p.verified_at}
            rejectionReason={p.rejection_reason}
          />
        ))}

        <div className="relative pl-8 pt-2 border-l-2 border-transparent">
           <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full flex items-center justify-center bg-[#1a1f36] border-2 border-gray-600">
             <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
           </div>
           
           <h4 className="font-bold text-gray-400 ml-2 mt-6 flex items-center gap-2">
             <ShieldCheck size={16} /> Final Delivery Locked
           </h4>
        </div>
      </div>

      <div className="mt-12 bg-black/40 rounded-xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="font-medium text-gray-300">Financial Progress</span>
          <span className="font-bold text-[#00c6ff]">{progressPercent.toFixed(0)}% Verified</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-[#00c6ff] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
};
