import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getAvatarUrl, handleAvatarError } from '../../context/AuthContext';
import {
  FiHome, FiCalendar, FiActivity, FiPhone,
  FiLogOut, FiUser, FiX, FiShield
} from 'react-icons/fi';

const navLinks = [
  { label: 'Home', path: '/', icon: FiHome },
  { label: 'Book Turf', path: '/book', icon: FiCalendar },
  { label: 'Live Scores', path: '/live', icon: FiActivity },
  { label: 'Contact Us', path: '/contact', icon: FiPhone },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, setShowAuthModal, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const isBookingFlow = location.pathname.startsWith('/book') || 
                        location.pathname.startsWith('/booking') || 
                        location.pathname.startsWith('/payment') ||
                        location.pathname === '/live';

  const isSubpage = location.pathname !== '/';
  const isSolid = scrolled || isSubpage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  if (location.pathname.startsWith('/payment')) return null;
  if (location.pathname === '/' && !scrolled) return null;

  const avatarUrl = getAvatarUrl(user);

  const handleBookNow = () => {
    if (isAuthenticated) {
      window.location.href = '/book';
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isSolid 
            ? 'h-[90px] bg-white shadow-sm border-b border-[#E2E8F0] flex items-center justify-center' 
            : 'py-6 px-4 lg:px-8 bg-transparent'
        }`}
      >
        <div className={isSolid ? "w-full flex items-center justify-center h-full" : "container max-w-7xl mx-auto"}>
          <div 
            className={`transition-all duration-300 flex items-center justify-between relative ${
              isSolid 
                ? 'w-[96%] lg:w-[94%] h-full bg-transparent px-0 py-0'
                : 'w-full bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-100/40 py-2.5 px-6 lg:px-8'
            }`}
          >
            {/* Left side: Logo */}
            <div className="flex items-center">
              {/* Center Logo: Stylized arches SVG and brand brand vertical */}
              <Link to="/" className="flex flex-col items-center justify-center gap-1 group hover:opacity-80 transition-opacity shrink-0 pt-1 scale-110">
                <svg width="56" height="20" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
                <span className="font-black italic text-[30px] tracking-tight leading-none pr-1">
                  <span className="text-[#0F172A]">Ero</span><span className="text-[#00C853]">Turf</span>
                </span>
              </Link>
            </div>

            {/* Center: Centered Links (Desktop) */}
            {!isBookingFlow && (
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-[14px] font-bold transition-all duration-200 ${
                        active
                          ? 'text-[#0F172A]'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Right side: Login trigger + Hamburger menu */}
            <div className="flex items-center gap-5">

              {/* Authenticated Profile / Sign In */}
              {isAuthenticated ? (
                <div className="flex items-center gap-5">
                  <button className="relative text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer pt-1">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="absolute -top-1 -right-1.5 flex items-center justify-center w-[18px] h-[18px] bg-[#EF4444] text-white text-[10px] font-bold rounded-full border-2 border-white">
                      3
                    </span>
                  </button>

                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <img 
                        src={avatarUrl} 
                        alt={user?.name} 
                        className="w-[38px] h-[38px] rounded-full object-cover" 
                        onError={(e) => handleAvatarError(e, user?.name)}
                      />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </motion.button>
                    <AnimatePresence>
                      {profileOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-white border border-gray-200 z-50 p-6 text-center select-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <div className="flex justify-center mt-2">
                              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm bg-white">
                                <img 
                                  src={avatarUrl} 
                                  alt="user" 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => handleAvatarError(e, user?.name)}
                                />
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col items-center">
                              <h3 className="text-lg font-bold text-gray-900 leading-none">{user?.name}</h3>
                              <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                @{user?.name?.toLowerCase().replace(/\s+/g, '') || 'player'}
                              </p>
                            </div>

                            {!isBookingFlow && (
                              <Link
                                to="/dashboard"
                                onClick={() => setProfileOpen(false)}
                                className="mt-5 block w-full text-center py-2 px-4 border border-gray-200 hover:border-[#00C853] hover:text-[#00C853] text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer bg-white"
                              >
                                Preview Dashboard
                              </Link>
                            )}
                            <div className="border-t border-gray-100 my-4" />
                            <div className="space-y-3 text-xs text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-medium">Email</span>
                                <span className="font-bold text-gray-700 truncate max-w-[150px]">{user?.email || '—'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-medium">Phone</span>
                                <span className="font-bold text-gray-700">{user?.phone || '—'}</span>
                              </div>
                            </div>
                            <div className="border-t border-gray-100 my-4" />
                            <button
                              onClick={() => {
                                setProfileOpen(false);
                                logout();
                              }}
                              className="w-full text-center py-2 px-4 border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Sign Out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-sm font-semibold text-[#475569] hover:text-[#00C853] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              )}

              {/* Hamburger Button (Playspots drawer toggle) */}
              {!isBookingFlow && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="w-10 h-10 md:hidden flex flex-col items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 text-[#0F172A] hover:bg-slate-100 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-5 h-[1.5px] bg-currentColor rounded-full" />
                  <div className="w-5 h-[1.5px] bg-currentColor rounded-full" />
                  <div className="w-5 h-[1.5px] bg-currentColor rounded-full" />
                </button>
              )}

            </div>
          </div>
        </div>
      </motion.nav>

      {/* Slide-out Navigation Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between select-none text-left"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-5 mb-6">
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
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all"
                  >
                    <FiHome className="text-xl" />
                    Home Page
                  </Link>
                  {navLinks.map((link) => {
                    const active = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 ${
                          active
                            ? 'text-white bg-[#00C853] shadow-md shadow-[#00C853]/25'
                            : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <link.icon className="text-xl" />
                        {link.label}
                      </Link>
                    );
                  })}
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

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-[45] flex items-center justify-around py-2 h-[68px]">
        {[
          { label: 'Home', path: '/', icon: FiHome },
          { label: 'Book', path: '/book', icon: FiCalendar },
          { label: 'Live', path: '/live', icon: FiActivity },
          { label: 'Account', path: isAuthenticated ? '/dashboard' : 'login', icon: FiUser },
        ].map((item) => {
          const isLoginAction = item.path === 'login';
          const active = isLoginAction 
            ? false 
            : location.pathname === item.path || (item.path === '/book' && location.pathname.startsWith('/book'));
            
          const handleClick = (e) => {
            if (isLoginAction) {
              e.preventDefault();
              setShowAuthModal(true);
            }
          };

          return (
            <Link
              key={item.label}
              to={isLoginAction ? '#' : item.path}
              onClick={handleClick}
              className={`flex flex-col items-center justify-center gap-1.5 w-16 h-full transition-all ${
                active 
                  ? 'text-[#00C853] scale-105 font-bold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <item.icon className="text-xl" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
