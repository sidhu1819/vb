import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ title, unreadCount = 0, onNotificationClick }) => {
  const { user } = useAuth();
  
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/10 bg-[#04060f]/80 backdrop-blur-md sticky top-0 z-20">
      <div>
        <h1 className="text-2xl font-bold text-white hidden md:block">{title}</h1>
        <p className="text-gray-400 text-sm hidden md:block">Good to see you, {user?.name?.split(' ')[0]}</p>
      </div>

      <div className="flex items-center gap-4 ml-auto relative">
        <button onClick={onNotificationClick} className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <Bell size={20} className="text-gray-300" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />}
        </button>
      </div>
    </header>
  );
};
