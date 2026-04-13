import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, Send, MessageSquareCheck, ExternalLink } from 'lucide-react';
import api from '../utils/api';

const Contact = () => {
  console.log('Rendering Contact');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', service: '', budget: '', message: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      await api.post('/contact', formData);
      setStatus({ 
        type: 'success', 
        msg: 'Thank you! Your message has been sent. For a much faster response, please reach out via WhatsApp.' 
      });
      setFormData({ name: '', email: '', phone: '', service: '', budget: '', message: '' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        msg: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const contactOptions = [
    {
      title: "Chat on WhatsApp",
      desc: "Fastest way to reach me — usually reply within 1 hour.",
      info: "+91 83281 82328",
      icon: MessageCircle,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10",
      buttonText: "Open WhatsApp →",
      href: "https://wa.me/918328182328?text=Hi%20M%20Siddhartha%20Reddy%2C%20I%20want%20to%20discuss%20a%20project"
    },
    {
      title: "Send an Email",
      desc: "For detailed project requirements and documents.",
      info: "vbsoftwaresolutions.founder@gmail.com",
      icon: Mail,
      color: "text-[#00c6ff]",
      bg: "bg-[#00c6ff]/10",
      buttonText: "Send Email →",
      href: "mailto:vbsoftwaresolutions.founder@gmail.com"
    },
    {
      title: "Based in Vizag",
      desc: "Meetings available after initial contact and discussion.",
      info: "Thagarapuvalasa, Visakhapatnam, AP",
      icon: MapPin,
      color: "text-[#7b5ea7]",
      bg: "bg-[#7b5ea7]/10",
      buttonText: null,
      href: null
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
    >
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Let's Discuss Your Project</h1>
        <p className="text-gray-400 text-lg">
          Reach out via WhatsApp for the fastest response, or fill the form below and I'll get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {contactOptions.map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-white/20 transition-all shadow-xl"
          >
            <div className={`p-4 rounded-2xl ${opt.bg} ${opt.color} mb-6 group-hover:scale-110 transition-transform`}>
              <opt.icon size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{opt.title}</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">{opt.desc}</p>
            <p className="text-white font-medium mb-6">{opt.info}</p>
            {opt.href && (
              <a 
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-sm font-semibold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
              >
                {opt.buttonText}
                <ExternalLink size={14} />
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 bg-gradient-to-br from-[#00c6ff]/10 to-transparent border border-[#00c6ff]/20 rounded-3xl">
            <h3 className="text-2xl font-bold mb-4">Direct Communication</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              When you work with VB Software Solutions, you work directly with the founder. No middle layers, no confusing agency hierarchies—just direct progress and quality code.
            </p>
            <div className="flex items-center gap-4 text-sm text-[#00c6ff] font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c6ff] animate-pulse"></span>
                Reply usually within 1-4 hours
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Or Send a Detailed Message</h2>
          <p className="text-gray-400 mb-8">I'll reach out via WhatsApp or email after reviewing your requirements.</p>
          
          {status.msg && (
            <div className={`p-4 rounded-xl mb-8 flex items-start gap-3 ${
              status.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {status.type === 'success' ? <MessageSquareCheck className="w-5 h-5 shrink-0" /> : null}
              <p>{status.msg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors" placeholder="john@company.com" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number / WhatsApp</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors" placeholder="+91 00000 00000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Interested Service</label>
                <select name="service" value={formData.service} onChange={handleChange} className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors text-white appearance-none">
                  <option value="">Select a service</option>
                  <option value="Business Website">Business Website</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Web App">Web Application</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Estimated Budget (Optional)</label>
              <select name="budget" value={formData.budget} onChange={handleChange} className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors text-white appearance-none">
                <option value="">Discuss later</option>
                <option value="< ₹50K">Less than ₹50K</option>
                <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                <option value="₹2L - ₹5L">₹2L - ₹5L</option>
                <option value="₹5L+">More than ₹5L</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Project Brief *</label>
              <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full bg-[#04060f] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00c6ff] transition-colors resize-none text-white" placeholder="Briefly describe what you're looking to build..."></textarea>
            </div>

            <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#00c6ff] hover:bg-white text-[#04060f] font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,198,255,0.2)]">
              {loading ? 'Sending...' : 'Send Message'}
              {!loading && <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
