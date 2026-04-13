import { useState } from 'react';
import { Download, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const TransactionTable = ({ transactions, isAdmin }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t => {
    if (filter !== 'All' && t.status.toLowerCase() !== filter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.invoice_number.toLowerCase().includes(q) && 
          !t.service_id?.title?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleDownloadPDF = async (invoiceId) => {
    try {
      toast.success('Generating PDF...');
      const response = await api.get(`/payments/invoice/${invoiceId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="bg-[#1a1f36] border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex bg-white/5 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          {['All', 'Verified', 'Pending', 'Rejected', 'Refunded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${filter === f ? 'bg-white/10 font-bold' : 'text-gray-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search invoice or service..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00c6ff] text-sm text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Invoice No</th>
              {isAdmin && <th className="p-4 font-medium">Client</th>}
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">USD / INR</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.length === 0 ? (
               <tr>
                 <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-gray-500">No transactions found</td>
               </tr>
            ) : filtered.map(t => (
              <tr key={t._id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono text-[#00c6ff]">{t.invoice_number}</td>
                {isAdmin && (
                  <td className="p-4">
                    <p className="font-medium text-white">{t.client_id?.name || 'Unknown'}</p>
                  </td>
                )}
                <td className="p-4">
                  <Link to={`/dashboard/${isAdmin ? 'admin' : 'client'}/services/${t.service_id?._id}`} className="hover:underline">
                    {t.service_id?.title || 'Deleted Service'}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{t.label} (Mile {t.milestone})</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-white">₹{t.amount_inr?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">${t.amount_usd}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    t.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                    t.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    t.status === 'refunded' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-amber-500/20 text-amber-500'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-400">
                  {new Date(t.verified_at || t.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {t.status === 'verified' ? (
                    <button onClick={() => handleDownloadPDF(t.invoice_number)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors text-xs text-white">
                      <Download size={14} /> PDF
                    </button>
                  ) : <span className="text-xs text-gray-600">N/A</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
