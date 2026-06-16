import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { getBooking } from '../services/api';
import { FiHome, FiCalendar, FiShare2, FiDownload } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

/* ─────────────────────────────────────────────
   BARCODE GENERATOR SVG
───────────────────────────────────────────── */
function BarcodeSVG({ value }) {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patterns = [
    [1, 2, 1, 3], [2, 1, 3, 1], [1, 3, 2, 1], [3, 1, 1, 2], [1, 1, 2, 3],
    [2, 2, 1, 1], [1, 2, 2, 1], [1, 1, 3, 2], [3, 2, 1, 1], [2, 1, 1, 3]
  ];
  
  let bars = [1, 1, 1]; // Start pattern
  for (let i = 0; i < 12; i++) {
    const digit = (hash + i) % 10;
    bars = [...bars, ...patterns[digit]];
  }
  bars = [...bars, 1, 1, 1]; // Stop pattern

  return (
    <svg width="220" height="52" viewBox="0 0 220 52" style={{ display: 'block', margin: '0 auto' }}>
      <g fill="#0F172A">
        {(() => {
          let currentX = 10;
          return bars.map((width, idx) => {
            const isBar = idx % 2 === 0;
            const barWidth = width * 1.4;
            const x = currentX;
            currentX += barWidth;
            if (isBar) {
              return <rect key={idx} x={x} y="0" width={barWidth} height="40" />;
            }
            return null;
          });
        })()}
      </g>
      <text x="110" y="49" textAnchor="middle" fontSize="9" fontFamily="monospace" letterSpacing="4" fill="#64748B">
        {value.slice(0, 15).toUpperCase()}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   TICKET CARD COMPONENT
───────────────────────────────────────────── */
function TicketCard({ booking, turf, currentUser }) {
  const ticketRef = useRef(null);
  const { state } = useLocation();

  const bookerName = booking?.user?.name || currentUser?.name || 'Booker Name';
  const bookerPhone = state?.phone || booking?.user?.phone || currentUser?.phone || 'Phone Number';
  const bookerEmail = booking?.user?.email || currentUser?.email || 'Email Address';

  const paymentMethod = state?.paymentMethod;
  const cardLast4 = state?.cardLast4;

  const phoneLast4 = bookerPhone.replace(/\D/g, '').slice(-4) || '8237';
  const displayLast4 = (paymentMethod === 'card' && cardLast4) ? cardLast4 : phoneLast4;

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const loadToast = toast.loading('Generating ticket image...');
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#F8FAFC',
        logging: false
      });
      const link = document.createElement('a');
      link.download = `Ticket-${booking.bookingId || 'Booking'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Ticket downloaded successfully! 🎟️', { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download ticket.', { id: loadToast });
    }
  };

  const renderPaymentIcon = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '18px', backgroundColor: '#EFF6FF', borderRadius: '4px', color: '#2563EB', fontSize: '9px', fontWeight: '900', fontStyle: 'italic', border: '1px solid #BFDBFE', flexShrink: 0 }}>
            UPI
          </div>
        );
      case 'netbanking':
        return (
          <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
            </svg>
          </div>
        );
      case 'wallet':
        return (
          <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        );
      default:
        return (
          <div style={{ position: 'relative', width: '28px', height: '18px', display: 'flex', flexShrink: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#EB001B', position: 'absolute', left: 0 }} />
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#F79E1B', position: 'absolute', right: 0, opacity: 0.85 }} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Ticket Wrapper */}
      <div
        ref={ticketRef}
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          position: 'relative',
          padding: '28px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}
      >
        
        {/* Top: Confetti & Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Thank you!</h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>Your ticket has been issued successfully</p>
        </div>

        {/* Booker details */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{bookerName}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{bookerPhone}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{bookerEmail}</div>
        </div>

        {/* Perforated Separator with Side Notch Cutouts */}
        <div style={{ position: 'relative', margin: '24px 0', height: '2px', display: 'flex', alignItems: 'center' }}>
          {/* Left notch */}
          <div style={{ position: 'absolute', left: '-35px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0' }} />
          {/* Dashed line */}
          <div style={{ width: '100%', borderTop: '2px dashed #E2E8F0' }} />
          {/* Right notch */}
          <div style={{ position: 'absolute', right: '-35px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' }} />
        </div>

        {/* Booking details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TICKET ID</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '3px' }}>{booking?.bookingId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Amount</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginTop: '3px' }}>₹{booking?.pricing?.total || booking?.price || '2000'}</div>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>DATE & TIME</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginTop: '3px' }}>
              {booking?.date} • {booking?.slot}
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>VENUE</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginTop: '3px' }}>
              {turf?.name || 'EROTURF - Main Ground'}
            </div>
          </div>

        </div>

        {/* Card info pill */}
        <div style={{ 
          marginTop: '20px',
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          border: '1px solid #E2E8F0'
        }}>
          {renderPaymentIcon()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{bookerName}</span>
            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>•••• {displayLast4}</span>
          </div>
        </div>

        {/* Lower Perforation line */}
        <div style={{ position: 'relative', margin: '24px 0 16px', height: '2px', display: 'flex', alignItems: 'center' }}>
          {/* Left notch */}
          <div style={{ position: 'absolute', left: '-35px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F8FAFC', borderRight: '1px solid #E2E8F0' }} />
          {/* Dashed line */}
          <div style={{ width: '100%', borderTop: '2px dashed #E2E8F0' }} />
          {/* Right notch */}
          <div style={{ position: 'absolute', right: '-35px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' }} />
        </div>

        {/* Barcode */}
        <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
          <BarcodeSVG value={booking?.bookingId || 'EroTurfTicket'} />
        </div>

        {/* Bottom wave notches */}
        <div style={{
          position: 'absolute',
          bottom: '-6px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 8px'
        }}>
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            />
          ))}
        </div>

      </div>

      {/* Action download button */}
      <button
        onClick={downloadTicket}
        className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 bg-emerald-50 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
      >
        <FiDownload className="text-sm" />
        Download Ticket as Image
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE EXPORT
───────────────────────────────────────────── */
export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState(state?.bookings || (state?.booking ? [state.booking] : []));
  const [turf, setTurf] = useState(state?.turf);
  const [loading, setLoading] = useState((state?.bookings || state?.booking) ? false : !!searchParams.get('booking'));

  const bookingId = searchParams.get('booking');

  useEffect(() => {
    if (bookings.length === 0 && bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  const fetchBooking = async (id) => {
    try {
      const { data } = await getBooking(id);
      if (data.bookings) {
        setBookings(data.bookings);
        setTurf(data.bookings[0]?.turf);
      } else if (data.booking) {
        setBookings([data.booking]);
        setTurf(data.booking?.turf);
      }
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const text = bookings.map(b => `🏏 Booked ${b?.team?.teamName || 'Slot'} at ${turf?.name}\n📅 ${b?.date} | ⏰ ${b?.slot}\n🎟️ ID: ${b?.bookingId}`).join('\n\n');
    if (navigator.share) {
      await navigator.share({ title: 'EROTURF Bookings', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Booking details copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-transparent border-t-[#10B981]"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50" style={{ paddingTop: '110px' }}>
      <div className="container mx-auto px-6 max-w-lg">
        
        {/* Upper Confirmation Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center mb-6"
        >
          <span className="badge bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full mb-3 inline-block">
            Step 3 of 3 — Confirmed!
          </span>
          <h1 className="text-3xl font-black mb-1.5 text-slate-800 tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your cricket session is booked. Download your ticket image or show it at the venue.
          </p>
        </motion.div>

        {/* Display each booking as a ticket */}
        {bookings && bookings.length > 0 && (
          <div className="flex flex-col gap-8 items-center mt-6">
            {bookings.map((b) => (
              <motion.div
                key={b.bookingId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full flex justify-center"
              >
                <TicketCard
                  booking={b}
                  turf={turf}
                  currentUser={user}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Navigation Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mt-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
          >
            <FiCalendar /> My Bookings
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-md"
          >
            <FiShare2 /> Share Details
          </button>
        </motion.div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <FiHome /> Back to Home
        </button>

      </div>
    </div>
  );
}
