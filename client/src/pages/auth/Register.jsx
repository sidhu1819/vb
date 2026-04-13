import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error('Account creation is by invitation only. Contact the admin.', { duration: 5000 });
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  return <div className="min-h-screen bg-[#04060f]" />;
};

export default Register;
