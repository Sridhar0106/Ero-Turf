import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getAvatarUrl, handleAvatarError } from '../context/AuthContext';
import {
  FiCalendar, FiStar, FiShield, FiZap, FiUsers, FiTrendingUp,
  FiInstagram, FiYoutube, FiFacebook, FiTwitter, FiLinkedin, FiMapPin, FiActivity,
  FiHeadphones, FiMail, FiX, FiHome, FiLogOut, FiUser, FiArrowRight, FiChevronDown, FiPhone
} from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import toast from 'react-hot-toast';

const features = [
  { icon: FiCalendar, title: 'Instant Booking', desc: 'Book your slot in under 60 seconds with our seamless booking system' },
  { icon: FiZap, title: 'Real-time Availability', desc: 'See live slot availability and never double-book again' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Pay safely with Razorpay, Google Pay, UPI, and all major cards' },
  { icon: FiUsers, title: 'Team Management', desc: 'Manage your team, track bookings, and view match history' },
  { icon: FiStar, title: 'Premium Facilities', desc: 'Floodlit grounds, changing rooms, parking, and equipment rental' },
  { icon: FiTrendingUp, title: 'Live Scores', desc: 'Follow live cricket matches and upcoming tournaments in real time' },
];

const stats = [
  { value: '500+', label: 'Matches Played', color: '#00C853' },
  { value: '2,000+', label: 'Happy Players', color: '#00C853' },
  { value: '98%', label: 'Satisfaction Rate', color: '#00C853' },
  { value: '4.9★', label: 'Average Rating', color: '#00C853' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const rotatingWords = ['GAMES', 'TOURNAMENTS', 'MATCHES', 'COACHES'];


export default function HomePage() {
  const { user, isAuthenticated, isAdmin, setShowAuthModal, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleBookNow = () => {
    if (searchQuery.trim()) {
      toast.success(`Booking request sent for: "${searchQuery}"`);
    }
    if (isAuthenticated) {
      navigate('/book');
    } else {
      sessionStorage.setItem('redirect_after_login', '/book');
      setShowAuthModal(true);
    }
  };

  const handleBookingLinkClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/book');
    } else {
      sessionStorage.setItem('redirect_after_login', '/book');
      setShowAuthModal(true);
    }
  };

  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="relative w-full overflow-x-hidden">
      
      {/* FULL-SCREEN HERO - PLAYO STYLE OVERHAUL */}
      <section className="w-full h-screen bg-white relative flex flex-col overflow-hidden">
        
        {/* STANDARD WHITE NAVBAR */}
        <header className="w-full bg-white flex items-center justify-center h-[90px] border-b border-gray-100 z-50 shrink-0">
          <div className="relative w-[96%] lg:w-[94%] flex items-center justify-between h-full">
            
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center justify-center gap-0.5 group hover:opacity-80 transition-opacity shrink-0 pt-1 scale-95 sm:scale-110">
              <svg className="w-11 h-4 sm:w-14 sm:h-5" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <span className="font-black italic text-[22px] sm:text-[30px] tracking-tight leading-none pr-1">
                <span className="text-[#0F172A]">Ero</span><span className="text-[#00C853]">Turf</span>
              </span>
            </Link>

            {/* Center Links */}
            <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
              <a href="/book" onClick={handleBookingLinkClick} className="flex items-center gap-2 text-[16px] font-medium text-[#333] hover:text-[#00C853] transition-colors">
              <svg className="w-5 h-5 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 21.5L3.5 16.5L12 8L17 13L8.5 21.5Z" />
                <line x1="14.5" y1="10.5" x2="19.5" y2="5.5" />
                <circle cx="20" cy="5" r="1" />
                <circle cx="18" cy="19" r="2" />
              </svg>
              Play
            </a>
              <a href="/book" onClick={handleBookingLinkClick} className="flex items-center gap-2 text-[16px] font-medium text-[#333] hover:text-[#00C853] transition-colors">
                <svg className="w-5 h-5 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93c2.61 2.61 6.85 2.61 9.46 0"/><path d="M4.93 19.07c2.61-2.61 6.85-2.61 9.46 0"/></svg>
                Book
              </a>
              <Link to="/live" className="flex items-center gap-2 text-[16px] font-medium text-[#333] hover:text-[#00C853] transition-colors">
                <svg className="w-5 h-5 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Live
              </Link>
            </div>

            {/* Right Action */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)} 
                    className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={avatarUrl} 
                      alt="user" 
                      className="w-full h-full object-cover" 
                      onError={(e) => handleAvatarError(e, user?.name)}
                    />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                         <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl bg-white border border-gray-200 z-50 p-6 text-center select-none"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {/* Online status badge absolute top right */}
                          <div className="absolute top-6 right-6">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                              Online
                            </span>
                          </div>

                          {/* Centered Large Avatar */}
                          <div className="flex justify-center mt-4">
                            <div className="w-28 h-28 rounded-full border border-gray-100 p-1 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                              <img 
                                src={avatarUrl} 
                                alt="user" 
                                className="w-full h-full rounded-full object-cover" 
                                onError={(e) => handleAvatarError(e, user?.name)}
                              />
                            </div>
                          </div>

                          {/* User Name & Badges */}
                          <div className="mt-4 flex flex-col items-center">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 leading-none">{user?.name}</h3>
                              <span className="inline-block bg-[#FF4081] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                                {user?.role === 'admin' ? 'Admin' : 'New'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">
                              @{user?.name?.toLowerCase().replace(/\s+/g, '') || 'player'}
                            </p>
                          </div>

                          {/* Preview Dashboard Action Button */}
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="mt-5 block w-full text-center py-2 px-4 border border-gray-200 hover:border-[#00C853] hover:text-[#00C853] text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer bg-white"
                          >
                            Preview Dashboard
                          </Link>

                          <div className="border-t border-gray-100 my-4" />

                          {/* User Details Details Section */}
                          <div className="space-y-3 text-xs text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <span>📍</span> From
                              </span>
                              <span className="font-bold text-gray-700">Erode, India</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <span>👤</span> Member since
                              </span>
                              <span className="font-bold text-gray-700">Jun 2026</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <span>✉️</span> Email
                              </span>
                              <span className="font-bold text-gray-700 truncate max-w-[150px]">{user?.email || 'dev@eroturf.com'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <span>📞</span> Phone
                              </span>
                              <span className="font-bold text-gray-700">{user?.phone || '+91 98765 43210'}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 my-4" />

                          {/* Edit/Logout button */}
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              logout();
                            }}
                            className="w-full text-center py-2 px-4 border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 text-[#333] hover:text-[#00C853] font-medium transition-colors cursor-pointer">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                  <span className="text-[15px]">Login / Signup</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* SPLIT HERO CONTENT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 content-center items-start">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col pl-7 pr-6 sm:pl-14 sm:pr-6 md:pl-24 md:pr-8 lg:pl-36 lg:pr-12 relative z-10 py-8 lg:py-12" style={{ paddingLeft: '10px' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Main Headline with Rotating Text Animation */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[68px] font-black text-[#1A1A1A] leading-tight mb-6 pt-2 font-hero">
                <span className="sm:whitespace-nowrap">THE EASIEST</span> <br /> 
                <span className="sm:whitespace-nowrap">WAY TO</span> <br /> 
                <span className="sm:whitespace-nowrap">
                  <span style={{ marginRight: '16px' }}>HOST</span>
                  <span className="inline-grid overflow-hidden align-baseline">
                  <AnimatePresence>
                    <motion.span
                      key={wordIndex}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="col-start-1 row-start-1 text-[#00C853]"
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="invisible col-start-1 row-start-1">TOURNAMENTS</span>
                </span>
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-[#6B7280] text-[17px] md:text-lg font-medium leading-relaxed max-w-lg mt-5 sm:mt-16 font-hero">
                Experience the ultimate sports facility. Whether you're planning a quick match, organizing a weekend tournament, or looking for premium training grounds, our dedicated turf offers instant online booking, world-class amenities, and hassle-free scheduling.
              </p>

              {/* CTA Button */}
              <div className="mt-10 sm:mt-16" style={{ marginTop: '20px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBookNow}
                  className="bg-[#00C853] hover:bg-[#00B248] text-white font-extrabold rounded-full shadow-xl shadow-[#00C853]/40 flex items-center gap-3 transition-all cursor-pointer"
                  style={{
                    padding: '16px 48px',
                    fontSize: '24px',
                  }}
                >
                  Book Now!
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Image Collage */}
          <div className="relative flex justify-center w-full py-4 lg:py-12 pl-0">
            
            {/* Mobile Image Grid (Visible on mobile only) */}
            <div className="lg:hidden grid grid-cols-3 gap-2 w-[94%] max-w-[850px] h-32 relative bg-white rounded-2xl overflow-hidden shadow-sm p-1 border border-slate-100">
              <div className="h-full w-full overflow-hidden bg-gray-100 relative rounded-xl">
                <img src="/hero3.jpg" alt="Night Turf" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="h-full w-full overflow-hidden bg-gray-100 relative rounded-xl">
                <img src="/hero4.jpg" alt="Football Field" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="h-full w-full overflow-hidden bg-gray-100 relative rounded-xl">
                <img src="/hero2.jpg" alt="Cricket Pitch" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>

            {/* Desktop Image Collage (Visible on desktop only) */}
            <div className="hidden lg:grid grid-cols-2 gap-2 w-[88%] max-w-[850px] h-[75vh] min-h-[500px] relative shadow-2xl bg-white rounded-3xl overflow-hidden">
              
              {/* Spinning Circular Text Decoration (Centered perfectly where the 3 images meet) */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden lg:block mix-blend-difference"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              >
                <svg width="160" height="160" viewBox="0 0 180 180" className="drop-shadow-lg">
                  <defs>
                    <path id="circlePath" d="M 90, 90 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
                  </defs>
                  <text fill="#FFFFFF" fontSize="14" fontWeight="bold" letterSpacing="4.5">
                    <textPath href="#circlePath">
                      YOUR PLATFORM TO PLAY • YOUR PLATFORM TO PLAY • 
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              
              {/* Left Large Image */}
              <div className="col-span-1 h-full w-full overflow-hidden bg-gray-100 relative min-h-0 rounded-2xl">
                <img src="/hero3.jpg" alt="Night Turf" className="absolute inset-0 w-full h-full object-cover" />
              </div>

              {/* Right Stacked Images */}
              <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
                <div className="w-full h-full overflow-hidden bg-gray-100 relative min-h-0 rounded-2xl">
                  <img src="/hero4.jpg" alt="Football Field 2" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="w-full h-full overflow-hidden bg-gray-100 relative min-h-0 rounded-2xl">
                  <img src="/hero2.jpg" alt="Cricket Bat" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              </div>

            </div>
          </div>
        </div>


      </section>

      {/* Slide-out Navigation Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Slide drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between select-none text-left"
            >
              
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5 mb-6">
                  
                  {/* Drawer Logo - Vertical */}
                  <Link to="/" className="flex flex-col items-center justify-center gap-1 scale-110 origin-left" onClick={() => setDrawerOpen(false)}>
                    <svg width="56" height="20" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                    <span className="font-black italic text-[30px] tracking-tight leading-none pr-1">
                      <span className="text-[#0F172A]">Ero</span><span className="text-[#00C853]">Turf</span>
                    </span>
                  </Link>

                  {/* Drawer Close Button */}
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <FiX className="text-lg" />
                  </button>

                </div>

                {/* Drawer Links */}
                <div className="space-y-1">
                  {/* Home Link explicitly inside Drawer */}
                  <Link
                    to="/"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                  >
                    <FiHome className="text-xl" />
                    Home Page
                  </Link>
                  
                  {/* Other Links */}
                  <Link
                    to="/book"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                  >
                    <FiCalendar className="text-xl" />
                    Book Turf
                  </Link>
                  
                  <Link
                    to="/live"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                  >
                    <FiActivity className="text-xl" />
                    Live Scores
                  </Link>

                  {/* Contact Us */}
                  <Link
                    to="/contact"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                  >
                    <FiCalendar className="text-xl" />
                    Contact Us
                  </Link>

                  {/* Contextual User Actions inside Drawer */}
                  {isAuthenticated && (
                    <div className="border-t border-[#E2E8F0] pt-4 mt-4 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                      >
                        <FiUser className="text-xl" />
                        My Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDrawerOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#00C853] hover:bg-[#00C853]/10 transition-all"
                        >
                          <FiShield className="text-xl" />
                          Admin Command Centre
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Status */}
              <div className="border-t border-[#E2E8F0] pt-5 text-center">
                {isAuthenticated ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={avatarUrl} 
                      alt={user?.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#00C853] mb-2 shadow-sm" 
                      onError={(e) => handleAvatarError(e, user?.name)}
                    />
                    <p className="text-sm font-extrabold text-[#0F172A]">{user?.name}</p>
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        logout();
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all cursor-pointer text-sm"
                    >
                      <FiLogOut /> Sign Out Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm shadow-md"
                  >
                    Get Started / Sign In
                  </button>
                )}
                <p className="text-[10px] text-[#475569] mt-6 font-semibold uppercase tracking-wider">
                  © EROTURF Sports Community
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
