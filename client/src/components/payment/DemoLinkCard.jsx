import { motion } from 'framer-motion';
import { Lock, Unlock, ExternalLink } from 'lucide-react';

export const DemoLinkCard = ({ demoLink, isLocked }) => {
  if (!demoLink) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1a1f36] border border-white/10 p-6 md:p-8 mt-6 group">
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${isLocked ? 'bg-amber-500/10' : 'bg-[#00c6ff]/20'}`} />

      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        {isLocked ? <Lock className="text-amber-500" /> : <Unlock className="text-[#00c6ff]" />}
        Your Project Demo
      </h3>

      {isLocked ? (
        <div className="relative">
          <div className="filter blur-md opacity-30 select-none cursor-default font-mono text-xs overflow-hidden h-8">
            https://demo.vbsoftware.com/preview/project-abcdef...
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
            <Lock className="text-white/50 mb-2 w-8 h-8" />
            <p className="text-sm text-center text-gray-300 font-medium px-4">Locked. Pay the 40% Kickoff milestone to reveal your live URL.</p>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 bg-black/40 border border-[#00c6ff]/30 p-4 rounded-xl font-mono text-sm text-[#00c6ff] break-all truncate">
            {demoLink}
          </div>
          <a
            href={demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 bg-[#00c6ff] text-[#04060f] font-bold rounded-xl hover:shadow-[0_0_20px_#00c6ff50] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Open Live Demo <ExternalLink size={18} />
          </a>
        </motion.div>
      )}
    </div>
  );
};
