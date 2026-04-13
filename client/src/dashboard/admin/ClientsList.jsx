import { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Search, Mail, Building, Clock, Plus, X, Copy, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, clientName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1f36] border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-red-500/5">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Delete Client?</h3>
        </div>
        
        <div className="p-6 text-gray-300">
          <p className="mb-4">Are you sure you want to delete <span className="text-white font-bold">{clientName}</span>?</p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
            <p><strong>Warning:</strong> This action is permanent and will delete all associated data for this client.</p>
          </div>
        </div>

        <div className="p-6 flex gap-3 border-t border-white/10">
          <button 
            onClick={onClose} 
            className="flex-1 py-2 text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', tempPassword: '' });
  const [passMode, setPassMode] = useState('auto');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, role: 'client' };
      if (passMode === 'auto') delete payload.tempPassword;
      const res = await api.post('/admin/users/create', payload);
      setSuccessData({
        name: res.data.user.name,
        email: res.data.user.email,
        tempPassword: res.data.tempPassword
      });
      onClientCreated(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (successData?.tempPassword) {
      navigator.clipboard.writeText(successData.tempPassword);
      toast.success('Password copied to clipboard');
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setFormData({ name: '', email: '', company: '', phone: '', tempPassword: '' });
    setPassMode('auto');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1f36] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold text-white">
            {successData ? '✅ Client Account Created!' : 'Create New Client Account'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {successData ? (
            <div className="space-y-4 text-center pb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
                <p className="text-gray-400 mb-1">Name: <span className="text-white font-medium">{successData.name}</span></p>
                <p className="text-gray-400 mb-4">Email: <span className="text-white font-medium">{successData.email}</span></p>
                
                <p className="text-gray-400 text-sm mb-2">Temporary Password:</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-xl text-[#00c6ff] tracking-wide text-center">
                    {successData.tempPassword}
                  </div>
                  <button onClick={handleCopy} className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10" title="Copy Password">
                    <Copy size={20} className="text-white" />
                  </button>
                </div>
              </div>
              
              <p className="text-yellow-500/80 text-sm font-medium">
                ⚠ This password is shown only once. An email has been sent to the client.
              </p>
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setSuccessData(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors">
                  Create Another
                </button>
                <button onClick={handleClose} className="flex-1 py-2.5 bg-[#00c6ff] hover:bg-[#00c6ff]/90 text-black font-medium rounded-lg transition-colors">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Company (Optional)</label>
                  <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone (Optional)</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm text-gray-400 mb-2">Temporary Password</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={passMode === 'auto'} onChange={() => setPassMode('auto')} className="accent-[#00c6ff]" />
                    <span className="text-sm text-white">Auto-generate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={passMode === 'manual'} onChange={() => setPassMode('manual')} className="accent-[#00c6ff]" />
                    <span className="text-sm text-white">Set manually</span>
                  </label>
                </div>
                
                {passMode === 'manual' ? (
                  <input required minLength={8} value={formData.tempPassword} onChange={e => setFormData({...formData, tempPassword: e.target.value})} placeholder="Enter 8+ characters" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00c6ff]" />
                ) : (
                  <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-500 italic">
                    Will be auto-generated
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-4">
                <button type="button" onClick={handleClose} className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 bg-[#00c6ff] hover:bg-[#00c6ff]/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState({ isOpen: false, client: null, isDeleting: false });

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientCreated = (newClient) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleDeleteClient = async () => {
    if (!deleteData.client) return;
    setDeleteData(prev => ({ ...prev, isDeleting: true }));
    try {
      await api.delete(`/admin/clients/${deleteData.client._id}`);
      toast.success('Client deleted successfully');
      setClients(prev => prev.filter(c => c._id !== deleteData.client._id));
      setDeleteData({ isOpen: false, client: null, isDeleting: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client');
      setDeleteData(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Topbar title="Client Registry" />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00c6ff]"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#00c6ff] hover:bg-[#00c6ff]/90 text-black font-semibold rounded-xl transition-all hover:scale-105">
            <Plus size={18} /> Create Client Account
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#00c6ff]"/></div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#1a1f36] border-b border-white/10">
                  <tr>
                    <th className="p-4 text-sm font-medium text-gray-400">Client Info</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Contact Details</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Joined Date</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Active Services</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map(client => (
                    <tr key={client._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {client.avatar ? (
                            <img src={client.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#7b5ea7] flex items-center justify-center font-bold text-white shrink-0">
                              {client.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white flex items-center gap-2">
                              {client.name}
                              {client.createdByAdmin && <span className="bg-[#00c6ff]/10 text-[#00c6ff] text-[10px] px-2 py-0.5 rounded-full border border-[#00c6ff]/20">Admin Created</span>}
                            </p>
                            {client.company && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Building size={12}/> {client.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                         <p className="text-sm text-gray-300 flex items-center gap-2 mb-1"><Mail size={14} className="text-[#00c6ff]"/> {client.email}</p>
                         <p className="text-xs text-gray-500">{client.googleId ? 'Google Auth' : 'Email Auth'}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[#7b5ea7]"/> {new Date(client.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                          {client.activeServices?.length || 0} Request(s)
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setDeleteData({ isOpen: true, client, isDeleting: false })}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-400">No clients found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <CreateClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onClientCreated={handleClientCreated} />
      
      <DeleteConfirmModal 
        isOpen={deleteData.isOpen} 
        onClose={() => setDeleteData({ isOpen: false, client: null, isDeleting: false })}
        onConfirm={handleDeleteClient}
        clientName={deleteData.client?.name}
        isDeleting={deleteData.isDeleting}
      />
    </>
  );
};
export default ClientsList;
