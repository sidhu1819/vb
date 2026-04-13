import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import PaymentPage from './pages/PaymentPage';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';

// Client Dashboard
import ClientLayout from './dashboard/client/ClientLayout';
import ClientOverview from './dashboard/client/Overview';
import MyServices from './dashboard/client/MyServices';
import ServiceDetail from './dashboard/client/ServiceDetail';
import Transactions from './dashboard/client/Transactions';
import Profile from './dashboard/client/Profile';

// Admin Dashboard
import AdminLayout from './dashboard/admin/AdminLayout';
import AdminDashboard from './dashboard/admin/Overview';
import AdminOverview from './dashboard/admin/Overview';
import AdminTransactions from './dashboard/admin/Transactions';
import RevenueAnalytics from './dashboard/admin/RevenueAnalytics';
import AllServices from './dashboard/admin/AllServices';
import AdminServiceDetail from './dashboard/admin/AdminServiceDetail';
import ClientsList from './dashboard/admin/ClientsList';
import AdminNotifications from './dashboard/admin/AdminNotifications';
import PaymentVerification from './dashboard/admin/PaymentVerification';

// Layout wrapper for Public pages
function PublicLayout() {
  const location = useLocation();
  const isAuth = location.pathname.startsWith('/auth');

  return (
    <div className="flex flex-col min-h-screen relative">
      {!isAuth && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {/* Framer motion wraps outlet for page transitions without remounting the Router */}
          <Outlet key={location.pathname.split('?')[0]} />
        </AnimatePresence>
      </main>
      {!isAuth && <Footer />}
    </div>
  );
}

import { FloatingWhatsApp } from './components/shared/WhatsAppButton';

function AppContent() {
  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ style: { background: '#1a1f36', color: '#fff', border: '1px solid #333' } }} 
      />
      <FloatingWhatsApp />
      <Routes>
        {/* Public & Auth Routes wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
        </Route>

        {/* Protected Dashboard Routes (These handle their own layouts natively) */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/dashboard/client" element={<ClientLayout />}>
             <Route index element={<ClientOverview />} />
             <Route path="services" element={<MyServices />} />
             <Route path="services/:id" element={<ServiceDetail />} />
             <Route path="transactions" element={<Transactions />} />
             <Route path="profile" element={<Profile />} />
             <Route path="payment" element={<PaymentPage />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['founder', 'employee']} />}>
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/dashboard/admin" element={<AdminLayout />}>
             <Route index element={<AdminOverview />} />
             <Route path="services" element={<AllServices />} />
             <Route path="services/:id" element={<AdminServiceDetail />} />
             <Route path="transactions" element={<AdminTransactions />} />
             <Route path="revenue" element={<RevenueAnalytics />} />
             <Route path="clients" element={<ClientsList />} />
             <Route path="notifications" element={<AdminNotifications />} />
             <Route path="verifications" element={<PaymentVerification />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
