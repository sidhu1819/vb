import { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import { TransactionTable } from '../../components/payment/TransactionTable';
import { Loader2, DollarSign, Activity, FileText } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
    </div>
  </div>
);

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get('/admin/payments/transactions');
        setTransactions(res.data);
      } catch (error) {
        toast.error('Failed to load network transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  const verifiedTx = transactions.filter(t => t.status === 'verified');
  const totalInr = verifiedTx.reduce((acc, curr) => acc + curr.amount_inr, 0);

  return (
    <>
      <Topbar title="Manual Payment Ledger" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Collected (Verified)" value={`₹${totalInr.toLocaleString()}`} icon={Activity} color="bg-green-500/20" />
          <StatCard title="Verified Receipts" value={verifiedTx.length} icon={FileText} color="bg-[#00c6ff]/20" />
          <StatCard title="Awaiting/Rejected" value={transactions.filter(t=>t.status==='pending'||t.status==='rejected').length} icon={DollarSign} color="bg-amber-500/20" />
        </div>

        <h2 className="text-xl font-bold mb-4">Global Network Ledger</h2>
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>
        ) : (
          <TransactionTable transactions={transactions} isAdmin={true} />
        )}
      </div>
    </>
  );
};
export default AdminTransactions;
