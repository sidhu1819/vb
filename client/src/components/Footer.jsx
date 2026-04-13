import { Link } from 'react-router-dom';
import { Code2, Mail, Phone, MapPin } from 'lucide-react';
import { InlineWhatsApp } from './shared/WhatsAppButton';
const Footer = () => {
  return (
    <footer className="bg-[#04060f] pt-16 pb-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="p-2 bg-gradient-to-br from-[#00c6ff] to-[#7b5ea7] rounded-lg">
                <Code2 className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c6ff] to-white">
                VB Software Solutions
              </span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Founded by M Siddhartha Reddy. We build modern, scalable, and stunning websites that deliver full attention to quality and business goals.
            </p>
            <div className="flex flex-col gap-4">
              <InlineWhatsApp className="w-fit" />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-[#00c6ff] transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-[#00c6ff] transition-colors">Services</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-[#00c6ff] transition-colors">Projects</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#00c6ff] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400 gap-3">
                <Mail className="w-4 h-4 text-[#00c6ff]" />
                <a href="mailto:vbsoftwaresolutions.founder@gmail.com" className="hover:text-white transition-colors">
                  vbsoftwaresolutions.founder@gmail.com
                </a>
              </li>
              <li className="flex items-center text-gray-400 gap-3">
                <Phone className="w-4 h-4 text-[#00c6ff]" />
                <a href="tel:+918328182328" className="hover:text-white transition-colors">
                  +91 83281 82328
                </a>
              </li>
              <li className="flex items-start text-gray-400 gap-3">
                <MapPin className="w-4 h-4 text-[#00c6ff] mt-1 shrink-0" />
                <span>Thagarapuvalasa, Vizag,<br />Andhra Pradesh</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VB Software Solutions. Created by M Siddhartha Reddy.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
