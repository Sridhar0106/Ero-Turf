import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/ui/Navbar';
import AuthModal from './components/auth/AuthModal';
import { PageLoader } from './components/ui/LoadingSkeleton';
import CricketLoader from './components/ui/CricketLoader';

import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import BookingSummaryPage from './pages/BookingSummaryPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import DashboardPage from './pages/DashboardPage';
import LiveScoresPage from './pages/LiveScoresPage';
import UpcomingMatchesPage from './pages/UpcomingMatchesPage';
import AdminDashboard from './pages/AdminDashboard';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function PrivateRoute({ children }) {
  const { isAuthenticated, loading, setShowAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [loading, isAuthenticated, setShowAuthModal]);

  if (loading) return <PageLoader />;
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ paddingTop: '120px' }}>
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-[#0F172A]">Authentication Required</p>
          <p className="text-sm text-[#475569]">Please sign in to access this page.</p>
          <button onClick={() => setShowAuthModal(true)} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/live" element={<LiveScoresPage />} />
          <Route path="/upcoming" element={<Navigate to="/live" replace />} />
          <Route path="/book" element={
            <PrivateRoute><BookingPage /></PrivateRoute>
          } />
          <Route path="/book/:turfId" element={
            <PrivateRoute><BookingPage /></PrivateRoute>
          } />
          <Route path="/booking/summary" element={
            <PrivateRoute><BookingSummaryPage /></PrivateRoute>
          } />
          <Route path="/payment" element={
            <PrivateRoute><PaymentPage /></PrivateRoute>
          } />
          <Route path="/payment/success" element={
            <PrivateRoute><PaymentSuccessPage /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function ContactPage() {
  return (
    <div className="min-h-screen pb-16 flex items-center justify-center bg-white" style={{ paddingTop: '120px' }}>
      <div className="container mx-auto px-6 max-w-lg text-center">
        <h1 className="section-heading text-[#0F172A] mb-4">Contact Us</h1>
        <div className="glass rounded-2xl p-8 space-y-4 text-left border border-[#E2E8F0] bg-white shadow-sm">
          {[
            { label: '📍 Address', value: '123 Sports Complex, ECR Road, Chennai - 600119' },
            { label: '📞 Phone', value: '+91 98765 43210' },
            { label: '✉️ Email', value: 'info@eroturf.com' },
            { label: '⏰ Hours', value: '6:00 AM – 12:00 AM (All Days)' },
          ].map((item) => (
            <div key={item.label} className="py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <p className="text-sm font-semibold text-[#10B981]">{item.label}</p>
              <p className="text-[#0F172A] mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" style={{ paddingTop: '120px' }}>
      <div className="text-center">
        <p className="text-8xl font-black gradient-text mb-4" style={{ fontFamily: 'var(--font-brand)' }}>404</p>
        <p className="text-xl text-[#475569] mb-6">Page not found</p>
        <a href="/" className="btn-primary inline-block px-8 py-3">← Go Home</a>
      </div>
    </div>
  );
}

const LOADING_MESSAGES = [
  "Preparing the pitch...",
  "Polishing the cherry...",
  "Powering up the floodlights...",
  "Padding up...",
  "Checking the outfield...",
  "Deciding the toss..."
];

function AppContent() {
  const { loading: authLoading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (!showPreloader) return;
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 600);
    return () => clearInterval(messageInterval);
  }, [showPreloader]);

  useEffect(() => {
    let timeoutId;
    const startTime = Date.now();

    const checkAndHide = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1800 - elapsed);
      timeoutId = setTimeout(() => {
        setShowPreloader(false);
      }, remaining);
    };

    if (!authLoading) {
      checkAndHide();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [authLoading]);

  // Handle body scroll locking
  useEffect(() => {
    if (showPreloader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreloader]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              y: -50,
              transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center select-none"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <CricketLoader message={loadingMessage} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} className="bg-white pb-[68px] md:pb-0">
        <Navbar />
        <AuthModal />
        <AnimatedRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
          }}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
