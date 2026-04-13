import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Briefcase, User, CreditCard } from 'lucide-react';
import { useState } from 'react';

export const Sidebar = ({ links, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const linkClasses = (path) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === path ? 'bg-[#7b5ea7]/20 text-[#00c6ff]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1f36] rounded-md text-white">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0f1d] border-r border-white/10 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-[#7b5ea7]">VB Solutions</Link>
          <Link to="/" className="text-2xl font-bold font-['Outfit'] text-white">VB<span className="text-[#00c6ff]">.</span></Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {links.map(link => {
             const Icon = link.icon;
             return (
               <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={linkClasses(link.path)}>
                 <Icon size={20} /> <span>{link.label}</span>
               </Link>
             )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#7b5ea7] flex items-center justify-center font-bold text-white shrink-0">{user?.name?.charAt(0)}</div>}
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};
