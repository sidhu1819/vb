import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Simple3DLogo } from './Simple3DLogo';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-[#04060f] text-white overflow-hidden relative">
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center overflow-hidden border-r border-white/10">
        <Simple3DLogo />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-12 z-20 text-center pointer-events-none">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-[#7b5ea7]">
            VB Software Solutions
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Elevating your digital presence.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto max-h-screen">
        <Link 
          to="/" 
          className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:-translate-x-1 z-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#00c6ff]/10 to-[#7b5ea7]/10 blur-[100px] -z-10 rounded-full" />
        
        <div className="w-full max-w-md relative z-10 py-10 mt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-400">{subtitle}</p>
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
