import { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import { TransactionTable } from '../../components/payment/TransactionTable';
import { Loader2, DollarSign, CreditCard, Clock } from 'lucide-react';
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

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get('/payments/transactions');
        setTransactions(res.data);
      } catch (error) {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  const totalSpentInr = transactions.filter(t => t.status === 'verified').reduce((acc, curr) => acc + curr.amount_inr, 0);
  const totalSpentUsd = transactions.filter(t => t.status === 'verified').reduce((acc, curr) => acc + curr.amount_usd, 0);
  const pendingInr = transactions.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount_inr, 0);

  return (
    <>
      <Topbar title="Transactions" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Spent (INR)" value={`₹${totalSpentInr.toLocaleString()}`} icon={CreditCard} color="bg-green-500/20" />
          <StatCard title="Total Spent (USD)" value={`$${totalSpentUsd.toLocaleString()}`} icon={DollarSign} color="bg-[#00c6ff]/20" />
          <StatCard title="Pending Payments (INR)" value={`₹${pendingInr.toLocaleString()}`} icon={Clock} color="bg-amber-500/20" />
        </div>

        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-[#00c6ff] animate-spin" /></div>
        ) : (
          <TransactionTable transactions={transactions} isAdmin={false} />
        )}
      </div>
    </>
  );
};
export default Transactions;
