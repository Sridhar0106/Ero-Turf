import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../config/firebase';
import { FiX, FiPhone, FiArrowRight, FiShield, FiArrowLeft, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GiCricketBat } from 'react-icons/gi';
import toast from 'react-hot-toast';

export default function AuthModal() {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    loginWithGoogle, 
    loginWithPhone, 
    requestTwilioOtp,
    verifyTwilioOtp,
    registerWithEmail, 
    loginWithEmail, 
    devLogin 
  } = useAuth();
  
  const [step, setStep] = useState('phone'); // phone | otp
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const recaptchaRef = useRef(null);
  const otpRefs = useRef([]);

  const isFirebaseConfigured =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key';

  useEffect(() => {
    if (!showAuthModal) {
      setStep('phone');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setOtp(['', '', '', '', '', '']);
    }
  }, [showAuthModal]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      toast.error('All fields are required');
      return;
    }
    if (phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const phoneNum = phone.startsWith('+') ? phone : `+91${phone}`;
      await registerWithEmail(name, email, phoneNum, password);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!name || !name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const phoneNum = phone.startsWith('+') ? phone : `+91${phone}`;
      await requestTwilioOtp(phoneNum);
      setStep('otp');
      setTimer(30);
      toast.success('OTP sent successfully!');
    } catch (err) {
      // Handled and toasted in requestTwilioOtp
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter 6-digit OTP'); return; }

    setLoading(true);
    try {
      const phoneNum = phone.startsWith('+') ? phone : `+91${phone}`;
      await verifyTwilioOtp(phoneNum, code, name);
    } catch (err) {
      // Handled and toasted in verifyTwilioOtp
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') setStep('phone');
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="w-full max-w-5xl relative bg-white border border-[#E2E8F0] shadow-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch"
          style={{
            borderRadius: '28px',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all z-10 border border-[#E2E8F0] bg-white shadow-sm cursor-pointer"
          >
            <FiX />
          </button>

          {/* Left pane: Cricket batsman card */}
          <div className="hidden md:block md:col-span-6 lg:col-span-5 auth-left-pane min-h-[500px]">
            <img
              src="/cricket-batsman.png"
              alt="Cricket Batsman"
              className="select-none"
            />
          </div>

          {/* Right pane: Verification Credentials Form */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7 flex flex-col justify-between py-6 md:px-6 relative min-h-[480px]">
            
             {/* Top section: Back button & Title */}
            <div>
              {/* Top logo & back button layout */}
              <div className="relative flex items-center justify-center w-full mb-8 min-h-[48px]" style={{ paddingTop: '32px' }}>
                {step === 'otp' && (
                  <button
                    onClick={handleBack}
                    className="auth-btn-back absolute left-0"
                    style={{ marginBottom: 0, top: '32px' }}
                  >
                    <FiArrowLeft /> Back
                  </button>
                )}
                
                {/* Centered Home Page Logo */}
                <div className="flex flex-col items-center justify-center gap-1 scale-120">
                  <svg width="64" height="22" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <span className="font-black italic text-[32px] tracking-tight leading-none pr-1">
                    <span className="text-[#0F172A]">Ero</span><span className="text-[#00C853]">Turf</span>
                  </span>
                </div>
              </div>

              {/* Header section */}
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-[#94A3B8] tracking-widest uppercase mb-1">
                  {step === 'phone' ? 'Verification for' : 'Confirm code for'}
                </p>
                <h2 className="text-3xl font-extrabold text-[#0F172A] uppercase leading-none tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                  {step === 'phone' ? 'OTP SIGN IN.' : 'VERIFY OTP.'}
                </h2>
              </div>
            </div>

            {/* Middle section: Inputs & Actions */}
            <div className="my-2">

              {/* PHONE OTP INPUT STEP */}
              {step === 'phone' && (
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="auth-input-container" style={{ marginBottom: '20px' }}>
                    <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-lg z-10" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Enter your name (for ticket)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      id="phone-name-input"
                    />
                  </div>

                  {/* Phone Input with +91 combined in pill */}
                  <div className="auth-input-phone-container" style={{ marginBottom: '20px' }}>
                    <div className="auth-input-phone-prefix">
                      <FiPhone className="text-[#94A3B8] text-lg" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      className="auth-input-phone"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      id="phone-login-input"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: phone.length >= 10 ? 1.01 : 1 }}
                    whileTap={{ scale: phone.length >= 10 ? 0.99 : 1 }}
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    className="auth-btn-primary"
                    id="phone-otp-submit-btn"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#94A3B8] border-t-[#0F172A] rounded-full animate-spin" />
                    ) : (
                      "Send OTP"
                    )}
                  </motion.button>
                </div>
              )}

              {/* OTP CODE CONFIRMATION STEP */}
              {step === 'otp' && (
                <div className="space-y-6">
                  <p className="text-sm text-[#475569]">
                    We've sent a 6-digit confirmation code to <span className="font-bold text-[#0F172A]">+91 {phone}</span>
                  </p>

                  <div className="flex gap-3 justify-center" style={{ marginBottom: '20px', marginTop: '10px' }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, i)}
                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl input-field"
                        style={{ padding: '0' }}
                        autoFocus={i === 0}
                        id={`otp-input-${i}`}
                      />
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: otp.join('').length === 6 ? 1.01 : 1 }}
                    whileTap={{ scale: otp.join('').length === 6 ? 0.99 : 1 }}
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.join('').length !== 6}
                    className="auth-btn-primary"
                    id="verify-otp-btn"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#94A3B8] border-t-[#0F172A] rounded-full animate-spin" />
                    ) : (
                      <>Verify OTP <FiShield /></>
                    )}
                  </motion.button>

                  <div className="text-center">
                    {timer > 0 ? (
                      <span className="text-sm text-[#475569] font-medium">
                        Resend OTP in <span className="font-bold">{timer}s</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleSendOTP}
                        className="text-sm font-bold text-[#10B981] hover:text-[#047857] cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Separator lines between Form and Google OAuth */}
              {step === 'phone' && (
                <>
                  <div className="relative flex items-center gap-3 py-2 mt-4">
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                    <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider select-none">Or continue with</span>
                    <div className="flex-1 h-px bg-[#E2E8F0]" />
                  </div>

                  <div className="space-y-3">
                    {/* Google OAuth Button */}
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="auth-btn-google"
                      id="google-login-btn"
                    >
                      <FcGoogle className="text-2xl" />
                      Google
                    </button>

                    {/* Developer mode fallback bypass */}
                    <button
                      onClick={devLogin}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold transition-all bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)] text-[#d97706] hover:bg-[rgba(245,158,11,0.1)] cursor-pointer"
                      id="dev-login-btn"
                    >
                      <FiShield /> Dev Mode Bypass (No Firebase)
                    </button>
                    
                    <div className="text-[10px] text-center text-[#94A3B8] mt-2 font-mono">
                      Firebase Project: <span className="font-bold text-[#475569]">{import.meta.env.VITE_FIREBASE_PROJECT_ID || 'None'}</span>
                      {import.meta.env.VITE_FIREBASE_API_KEY && (
                        <span> ({import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 8)}...{import.meta.env.VITE_FIREBASE_API_KEY.slice(-4)})</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom section: Terms & Conditions */}
            <p className="text-xs text-center text-[#94A3B8] select-none mt-2">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
          
          <div id="recaptcha-container" ref={recaptchaRef} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
