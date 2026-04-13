import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FloatingWhatsApp = () => {
  const whatsappUrl = "https://wa.me/918328182328?text=Hi%2C%20I%20want%20to%20discuss%20a%20project";

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-50 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25"></div>
      <div className="relative bg-[#25D366] p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center transition-transform duration-300">
        <MessageCircle className="text-white w-7 h-7 fill-current" />
        <span className="absolute right-full mr-4 bg-[#1a1f36] text-white text-sm px-4 py-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl">
          Chat with us
        </span>
      </div>
    </motion.a>
  );
};

export const InlineWhatsApp = ({ className = "" }) => {
  const whatsappUrl = "https://wa.me/918328182328?text=Hi%2C%20I%20want%20to%20discuss%20a%20project";

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-4 py-2 rounded-lg border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all font-medium ${className}`}
    >
      <MessageCircle size={18} className="fill-current" />
      Chat on WhatsApp
    </a>
  );
};
