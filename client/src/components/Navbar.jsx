import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-[#04060f]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-[#00c6ff] to-[#7b5ea7] rounded-lg">
              <Code2 className="text-white w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-white">
              VB Software
            </span>
          </Link>
          
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-[#00c6ff] ${
                    location.pathname === link.path ? 'text-[#00c6ff]' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="h-0.5 bg-[#00c6ff] mt-1"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block flex-shrink-0">
            <Link 
              to="/auth/login" 
              className="px-6 py-2.5 bg-gradient-to-r from-[#00c6ff] to-[#7b5ea7] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,198,255,0.4)] transition-all flex items-center justify-center whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white pt-2 ml-4"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-[#04060f]/95 backdrop-blur-md border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'text-[#00c6ff] bg-white/5'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/auth/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 mt-4 rounded-md text-base font-bold text-center bg-gradient-to-r from-[#00c6ff] to-[#7b5ea7] text-white"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
