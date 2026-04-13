import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton = ({ label = 'Back', to, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all hover:-translate-x-1 mb-6 mt-2 ${className}`}
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
};
