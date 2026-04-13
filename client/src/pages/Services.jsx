import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import api from '../utils/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₹15K',
      desc: 'Perfect for small businesses and personal brands.',
      features: ['5 Page Website', 'Mobile Responsive', 'Contact Form', 'Basic SEO', '1 Month Support'],
      highlight: false
    },
    {
      name: 'Growth',
      price: '₹35K',
      desc: 'Ideal for growing companies needing more features.',
      features: ['Custom Design', 'E-Commerce Setup', 'CMS Integration', 'Advanced SEO', '3 Months Support'],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For large scale applications and unique requirements.',
      features: ['Full-stack App', 'Custom Architecture', 'API Integration', 'Performance Tuning', '24/7 Support'],
      highlight: false
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
        <p className="text-gray-400 text-lg">
          Comprehensive digital solutions tailored to help your business innovate, grow, and succeed in the modern web era.
        </p>
      </div>

      {/* Services Grid */}
      <div className="mb-24">
        {loading ? (
          <div className="text-center text-[#00c6ff]">Loading services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div key={svc._id} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-3">{svc.title}</h3>
                <p className="text-gray-400 mb-6 flex-grow">{svc.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {svc.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-1 rounded-md bg-[#7b5ea7]/20 text-[#7b5ea7] border border-[#7b5ea7]/30">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[#00c6ff] font-semibold text-lg border-t border-white/10 pt-4 mt-auto">
                  Starting at {svc.price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div>
        <h2 className="text-3xl font-bold mb-12 text-center">Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative rounded-3xl p-8 ${
                tier.highlight 
                  ? 'bg-gradient-to-b from-[#00c6ff]/20 to-transparent border border-[#00c6ff]/50 md:-translate-y-4' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00c6ff] text-[#04060f] text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">{tier.desc}</p>
              <div className="text-4xl font-extrabold mb-8">{tier.price}</div>
              
              <ul className="space-y-4 mb-8">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-[#00c6ff]" />
                    {feat}
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3 rounded-full font-bold transition-transform hover:scale-105 ${
                tier.highlight ? 'bg-[#00c6ff] text-[#04060f]' : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Services;
