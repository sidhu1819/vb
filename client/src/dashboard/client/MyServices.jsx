import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Filter, Plus, X, Monitor, Loader2 } from 'lucide-react';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'in-review': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    'in-progress': 'bg-[#00c6ff]/20 text-[#00c6ff] border-[#00c6ff]/30',
    review: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    completed: 'bg-green-500/20 text-green-500 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-500 border-red-500/30'
  };
  const labels = {
    pending: 'Pending', 'in-review': 'In Review', 'in-progress': 'In Progress',
    review: 'Final Review', completed: 'Completed', cancelled: 'Cancelled'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.pending}`}>
      {labels[status] || 'Unknown'}
    </span>
  );
};

const ServiceRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { serviceType: '', budget: '', timeline: '' }
  });

  const type = watch('serviceType');

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/client/services', data);
      toast.success('Service requested successfully!');
      onSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request service');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1f36] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1a1f36] z-10">
          <h2 className="text-xl font-bold">Request New Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-[#00c6ff]' : 'bg-white/10'}`} />
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); setStep(s => s+1); }}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">What do you need?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Web Development', 'E-Commerce', 'UI/UX Design', 'SEO & Marketing', 'Mobile App', 'Maintenance'].map((t, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setValue('serviceType', t, { shouldValidate: true }) }}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${type === t ? 'border-[#00c6ff] bg-[#00c6ff]/10' : 'border-white/10 hover:border-gray-500'}`}
                    >
                      <Monitor className="text-[#00c6ff] mb-2" size={24} />
                      <p className="font-bold">{t}</p>
                    </div>
                  ))}
                </div>
                {!type && <p className="text-sm text-gray-400 mt-2">Please select a service type to continue.</p>}
                <div className="flex justify-end mt-8">
                  <button type="submit" disabled={!type} className="px-6 py-2 bg-[#00c6ff] text-[#04060f] font-bold rounded-lg disabled:opacity-50">Next Step</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium mb-4">Project Details</h3>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Project Title</label>
                  <input {...register('title', { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00c6ff] focus:outline-none" placeholder="E.g. new company website" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea {...register('description', { required: true })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-[#00c6ff] focus:outline-none" placeholder="Describe your requirements..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Budget Range</label>
                    <select {...register('budget', { required: true })} className="w-full bg-[#1a1f36] border border-white/10 rounded-lg p-3 text-white focus:border-[#00c6ff] focus:outline-none appearance-none">
                      <option value="">Select...</option>
                      <option value="<$1K">Under $1k</option>
                      <option value="$1K-$5K">$1k - $5k</option>
                      <option value="$5K-$10K">$5k - $10k</option>
                      <option value="$10K+">$10k+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Timeline</label>
                    <select {...register('timeline', { required: true })} className="w-full bg-[#1a1f36] border border-white/10 rounded-lg p-3 text-white focus:border-[#00c6ff] focus:outline-none appearance-none">
                      <option value="">Select...</option>
                      <option value="1 month">1 Month</option>
                      <option value="2-3 months">2-3 Months</option>
                      <option value="3-6 months">3-6 Months</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5">Back</button>
                  <button type="submit" className="px-6 py-2 bg-[#00c6ff] text-[#04060f] font-bold rounded-lg">Review Details</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 text-sm">
                <h3 className="text-lg font-medium mb-4">Confirm Details</h3>
                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                  <p><span className="text-gray-400">Service:</span> {type}</p>
                  <p><span className="text-gray-400">Title:</span> {watch('title')}</p>
                  <p><span className="text-gray-400">Budget:</span> {watch('budget')}</p>
                  <p><span className="text-gray-400">Timeline:</span> {watch('timeline')}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-gray-400 mb-1">Description:</p>
                  <p className="whitespace-pre-wrap">{watch('description')}</p>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-2 border border-white/10 rounded-lg hover:bg-white/5">Back</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#00c6ff] text-[#04060f] font-bold rounded-lg flex items-center justify-center min-w-[120px]">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const MyServices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === 'true');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/client/services');
        setServices(res.data);
      } catch (err) {
        console.error("Fetch services error:", err.response?.data || err.message);
        if (err.response?.status !== 404) {
           toast.error(err.response?.data?.message || 'Failed to fetch services');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['pending', 'in-review', 'in-progress', 'review'].includes(s.status);
    if (filter === 'Completed') return s.status === 'completed';
    return true;
  });

  return (
    <>
      <Topbar title="My Services" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            {['All', 'Active', 'Completed'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <button onClick={() => { setIsModalOpen(true); setSearchParams({}); }} className="flex items-center gap-2 px-4 py-2 bg-[#00c6ff] text-[#04060f] font-bold rounded-lg hover:shadow-[0_0_15px_#00c6ff50] transition-all">
            <Plus size={18} /> Request Service
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#00c6ff]" /></div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No services found</h3>
            <p className="text-gray-400">You don't have any matching services yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.map(s => (
              <Link key={s._id} to={`/dashboard/client/services/${s._id}`} className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00c6ff]/30 hover:bg-white/10 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                  <ChevronRight className="text-[#00c6ff]" />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00c6ff] transition-colors">{s.title}</h3>
                    <p className="text-sm border border-white/10 bg-white/5 rounded pl-2.5 pr-2.5 inline-block py-0.5 text-gray-300">{s.serviceType}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{s.description}</p>

                <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
                  <span className="text-gray-300">Budget: <span className="text-white font-medium">{s.budget}</span></span>
                  <span className="text-gray-300">Timeline: <span className="text-white font-medium">{s.timeline}</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ServiceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={(newService) => setServices([newService, ...services])} />
    </>
  );
};

export default MyServices;
