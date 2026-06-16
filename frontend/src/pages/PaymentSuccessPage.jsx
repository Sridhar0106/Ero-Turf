import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { getBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

/* ─────────────────────────────────────────────
   BARCODE SVG
───────────────────────────────────────────── */
function BarcodeSVG({ value }) {
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patterns = [
    [1, 2, 1, 3], [2, 1, 3, 1], [1, 3, 2, 1], [3, 1, 1, 2], [1, 1, 2, 3],
    [2, 2, 1, 1], [1, 2, 2, 1], [1, 1, 3, 2], [3, 2, 1, 1], [2, 1, 1, 3]
  ];
  let bars = [1, 1, 1];
  for (let i = 0; i < 14; i++) {
    const digit = (hash + i) % 10;
    bars = [...bars, ...patterns[digit]];
  }
  bars = [...bars, 1, 1, 1];

  return (
    <svg width="260" height="56" viewBox="0 0 260 56" style={{ display: 'block', margin: '0 auto' }}>
      <g fill="#1a1a1a">
        {(() => {
          let currentX = 4;
          return bars.map((width, idx) => {
            const isBar = idx % 2 === 0;
            const barWidth = width * 1.3;
            const x = currentX;
            currentX += barWidth;
            if (isBar) {
              return <rect key={idx} x={x} y="0" width={barWidth} height="44" />;
            }
            return null;
          });
        })()}
      </g>
      <text x="130" y="54" textAnchor="middle" fontSize="9" fontFamily="monospace" letterSpacing="3" fill="#555">
        {value.toUpperCase()}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   CONFETTI PARTICLE
───────────────────────────────────────────── */
function ConfettiParticle({ x, y, color, rotate, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x, rotate: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: y + 80, rotate, scale: [0, 1, 1, 0.5] }}
      transition={{ duration: 2.5, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: 0,
        left: `${x}%`,
        width: '8px',
        height: '8px',
        backgroundColor: color,
        borderRadius: rotate % 2 === 0 ? '50%' : '2px',
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   TICKET COMPONENT
───────────────────────────────────────────── */
function TicketCard({ booking, turf, currentUser }) {
  const ticketRef = useRef(null);
  const { state } = useLocation();

  const bookerName = booking?.user?.name || currentUser?.displayName || currentUser?.name || 'Booker';
  const bookerPhone = state?.phone || booking?.user?.phone || currentUser?.phone || '';
  const bookerEmail = booking?.user?.email || currentUser?.email || '';
  const paymentMethod = state?.paymentMethod || 'upi';
  const cardLast4 = state?.cardLast4;
  const phoneLast4 = bookerPhone.replace(/\D/g, '').slice(-4) || '0000';
  const displayLast4 = (paymentMethod === 'card' && cardLast4) ? cardLast4 : phoneLast4;

  const initials = bookerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const turfName = turf?.name || booking?.turf?.name || 'EROTURF - Main Ground';
  const turfDisplayName = turfName.replace('EROTURF - ', '').replace('EROTURF-', '');
  const turfVenueLine1 = 'EROTURF';
  const turfVenueLine2 = turfDisplayName || 'Main Ground';

  const bookingDate = booking?.date
    ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : booking?.date || 'Selected Date';

  const slots = Array.isArray(booking?.slots) && booking.slots.length > 0
    ? booking.slots
    : booking?.slot ? [booking.slot] : [];
  const timeDisplay = slots.length > 0 ? slots[0] : '—';

  const amount = booking?.pricing?.total || booking?.price || '—';

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const loadToast = toast.loading('Generating ticket...');
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#F5F0E8',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Ticket-${booking.bookingId || 'Booking'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Ticket downloaded! 🎟️', { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download.', { id: loadToast });
    }
  };

  const renderPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      default: return 'Card';
    }
  };

  const upiId = bookerEmail ? `${bookerEmail.split('@')[0]}@upi` : `user@upi`;

  return { ticketRef, downloadTicket, initials, bookerName, bookerPhone, bookerEmail, bookingDate, timeDisplay, amount, turfVenueLine1, turfVenueLine2, paymentMethod, renderPaymentMethodLabel, upiId, displayLast4 };
}

/* ─────────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────────── */
const IconTicket = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6v6a3 3 0 010 6H2a3 3 0 010-6V9z" />
  </svg>
);
const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconBookings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function PaymentSuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [bookings, setBookings] = useState(state?.bookings || (state?.booking ? [state.booking] : []));
  const [turf, setTurf] = useState(state?.turf);
  const [loading, setLoading] = useState((state?.bookings || state?.booking) ? false : !!searchParams.get('booking'));

  const ticketRef = useRef(null);
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

  const booking = bookings[0] || {};

  const bookerName = booking?.user?.name || user?.displayName || user?.name || 'Booker';
  const bookerPhone = state?.phone || booking?.user?.phone || user?.phone || '';
  const bookerEmail = booking?.user?.email || user?.email || '';
  const paymentMethod = state?.paymentMethod || 'upi';
  const cardLast4 = state?.cardLast4;
  const phoneLast4 = bookerPhone.replace(/\D/g, '').slice(-4) || '0000';
  const displayLast4 = (paymentMethod === 'card' && cardLast4) ? cardLast4 : phoneLast4;

  const initials = bookerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const turfName = turf?.name || booking?.turf?.name || 'EROTURF - Main Ground';
  const bookingDate = booking?.date
    ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : (booking?.date || '—');

  const slots = Array.isArray(booking?.slots) && booking.slots.length > 0
    ? booking.slots
    : booking?.slot ? booking.slot.split(', ') : [];
  const timeDisplay = slots[0] || '—';
  const amount = booking?.pricing?.total || booking?.price || '—';
  const upiId = bookerEmail ? `${bookerEmail.split('@')[0]}@upi` : 'user@upi';

  const getPaymentLabel = () => {
    switch (paymentMethod) {
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      default: return 'Card';
    }
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const loadToast = toast.loading('Generating ticket...');
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#F5F0E8',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Ticket-${booking.bookingId || 'Booking'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Ticket downloaded! 🎟️', { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download.', { id: loadToast });
    }
  };

  const handleShare = async () => {
    const text = bookings.map(b =>
      `🏏 Booked at ${turfName}\n📅 ${b?.date} | ⏰ ${b?.slot}\n🎟️ ID: ${b?.bookingId}`
    ).join('\n\n');
    if (navigator.share) {
      await navigator.share({ title: 'EROTURF Booking', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Booking details copied!');
    }
  };

  const confettiColors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F97316'];
  const confettiItems = Array.from({ length: 16 }, (_, i) => ({
    x: (i * 7) % 100,
    y: 20 + (i * 13) % 60,
    color: confettiColors[i % confettiColors.length],
    rotate: (i * 47) % 360,
    delay: 0.1 + (i * 0.08),
  }));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F2318' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#10B981' }}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .psp-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #111A13;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-bottom: 100px;
        }

        /* Background blurred texture */
        .psp-bg-blur {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(16, 100, 50, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(8, 60, 30, 0.4) 0%, transparent 60%),
            linear-gradient(135deg, #0a1a0d 0%, #111A13 50%, #0d1f12 100%);
          z-index: 0;
        }

        .psp-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 0 20px;
          padding-top: 60px;
        }

        /* ── HEADER SECTION ── */
        .psp-header {
          text-align: center;
          margin-bottom: 28px;
          position: relative;
        }

        .psp-check-ring {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.15), 0 0 40px rgba(16, 185, 129, 0.25);
        }

        .psp-title {
          font-size: 34px;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }

        .psp-subtitle {
          font-size: 14px;
          color: #F59E0B;
          font-weight: 600;
          margin: 0;
        }

        /* ── TICKET WRAPPER ── */
        .psp-ticket-wrap {
          border-radius: 20px;
          overflow: visible;
          position: relative;
        }

        /* ── DARK GREEN TICKET HEADER ── */
        .psp-ticket-header {
          background: linear-gradient(135deg, #1B4332 0%, #15392B 100%);
          border-radius: 20px 20px 0 0;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .psp-ticket-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
        }

        .psp-brand-area {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .psp-brand-icon {
          width: 44px;
          height: 44px;
          background: rgba(245, 158, 11, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .psp-brand-name {
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .psp-brand-name span { color: #10B981; }

        .psp-brand-tagline {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 1px;
          font-weight: 500;
        }

        /* Thank you stamp */
        .psp-stamp {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2.5px dashed rgba(245, 158, 11, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .psp-stamp-text {
          font-size: 7.5px;
          font-weight: 800;
          color: #F59E0B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1.2;
          text-align: center;
        }

        /* ── TICKET BODY ── */
        .psp-ticket-body {
          background: #F5F0E8;
          padding: 0 24px 24px;
          position: relative;
        }

        /* Perforated tear line */
        .psp-tear-line {
          position: relative;
          height: 32px;
          display: flex;
          align-items: center;
        }

        .psp-tear-line::before {
          content: '';
          position: absolute;
          left: -24px;
          right: -24px;
          top: 50%;
          height: 2px;
          background: repeating-linear-gradient(to right, #C8BDA8 0, #C8BDA8 8px, transparent 8px, transparent 14px);
        }

        .psp-tear-notch-l,
        .psp-tear-notch-r {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #111A13;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }
        .psp-tear-notch-l { left: -32px; }
        .psp-tear-notch-r { right: -32px; }

        /* User section */
        .psp-user-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .psp-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1B4332, #10B981);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .psp-user-info h3 {
          font-size: 17px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 3px;
        }
        .psp-user-info h3 span { color: #10B981; }

        .psp-user-contact {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .psp-contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }

        /* Details grid */
        .psp-details-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .psp-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .psp-detail-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1B4332;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .psp-detail-label {
          font-size: 10px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 3px;
        }

        .psp-detail-value {
          font-size: 14px;
          font-weight: 800;
          color: #111827;
          line-height: 1.3;
        }

        /* Paid by card */
        .psp-paid-card {
          background: #fff;
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .psp-upi-logo {
          background: #EFF6FF;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 900;
          color: #1D4ED8;
          font-style: italic;
          border: 1px solid #BFDBFE;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .psp-paid-info {
          flex: 1;
        }

        .psp-paid-by-label {
          font-size: 10px;
          color: #9CA3AF;
          font-weight: 600;
          margin-bottom: 1px;
        }

        .psp-paid-name {
          font-size: 14px;
          font-weight: 800;
          color: #111827;
        }

        .psp-paid-sub {
          font-size: 11px;
          color: #6B7280;
          margin-top: 1px;
        }

        .psp-paid-badge {
          border: 2px solid #10B981;
          color: #10B981;
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Barcode section */
        .psp-barcode-card {
          background: #F9F7F2;
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        /* Bottom tear line */
        .psp-tear-line-bottom {
          position: relative;
          height: 0;
          margin: 16px -24px;
        }
        .psp-tear-line-bottom::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 2px;
          background: repeating-linear-gradient(to right, #C8BDA8 0, #C8BDA8 8px, transparent 8px, transparent 14px);
        }
        .psp-tear-notch-bl,
        .psp-tear-notch-br {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #111A13;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }
        .psp-tear-notch-bl { left: 0; }
        .psp-tear-notch-br { right: 0; }

        /* Ticket bottom notch row */
        .psp-ticket-footer {
          background: #F5F0E8;
          border-radius: 0 0 20px 20px;
          padding: 6px 0 12px;
          display: flex;
          justify-content: space-around;
          position: relative;
          overflow: hidden;
        }

        .psp-bottom-notch {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #111A13;
          opacity: 0.3;
        }

        /* ── ACTION BUTTONS ── */
        .psp-actions {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .psp-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 8px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.15s ease;
          line-height: 1.2;
          text-align: center;
        }

        .psp-action-btn.download {
          background: linear-gradient(135deg, #10B981, #059669);
          color: #fff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .psp-action-btn.download:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        .psp-action-btn.share {
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: #fff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        .psp-action-btn.share:hover {
          background: linear-gradient(135deg, #D97706, #B45309);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
        }

        .psp-action-btn.bookings {
          background: linear-gradient(135deg, #1B4332, #15392B);
          color: #fff;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
        }
        .psp-action-btn.bookings:hover {
          background: linear-gradient(135deg, #15392B, #0f2a1e);
          transform: translateY(-1px);
        }

        .psp-action-btn.home {
          background: #2D3748;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .psp-action-btn.home:hover {
          background: #1A202C;
          transform: translateY(-1px);
        }

        /* Footer notice */
        .psp-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }

        @media (max-width: 440px) {
          .psp-content { padding: 0 16px; padding-top: 50px; }
          .psp-title { font-size: 28px; }
          .psp-details-card { grid-template-columns: 1fr 1fr; gap: 14px; }
          .psp-action-btn { padding: 12px 6px; font-size: 10px; }
        }
      `}</style>

      <div className="psp-root">
        <div className="psp-bg-blur" />

        {/* Confetti */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '200px', overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
          {confettiItems.map((item, i) => (
            <ConfettiParticle key={i} {...item} />
          ))}
        </div>

        <div className="psp-content">

          {/* ── HEADER ── */}
          <motion.div
            className="psp-header"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', damping: 20 }}
          >
            <div className="psp-check-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="psp-title">Order Confirmed!</h1>
            <p className="psp-subtitle">Your ticket has been issued successfully</p>
          </motion.div>

          {/* ── TICKET ── */}
          <motion.div
            className="psp-ticket-wrap"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', damping: 22 }}
          >
            {/* Dark green header card */}
            <div className="psp-ticket-header">
              <div className="psp-brand-area">
                <div className="psp-brand-icon">
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 22, height: 22 }}>
                    <path d="M4 20 L12 4 L20 20 L12 16 Z" fill="#F59E0B" opacity="0.9" />
                    <circle cx="12" cy="9" r="2" fill="#F59E0B" />
                  </svg>
                </div>
                <div>
                  <div className="psp-brand-name">Ero<span>Turf</span></div>
                  <div className="psp-brand-tagline">Book. Play. Win.</div>
                </div>
              </div>
              {/* Thank You Stamp */}
              <div className="psp-stamp">
                <div className="psp-stamp-text">THANK<br />YOU<br />❤</div>
              </div>
            </div>

            {/* Cream Ticket Body */}
            <div ref={ticketRef} className="psp-ticket-body">

              {/* Tear line with notches */}
              <div className="psp-tear-line">
                <div className="psp-tear-notch-l" />
                <div className="psp-tear-notch-r" />
              </div>

              {/* User Row */}
              <div className="psp-user-row">
                <div className="psp-avatar">{initials}</div>
                <div className="psp-user-info">
                  <h3>Thank you, <span>{bookerName}!</span></h3>
                  <div className="psp-user-contact">
                    {bookerPhone && (
                      <div className="psp-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 11.4 19.79 19.79 0 011.62 2.82 2 2 0 013.6.64h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.14a16 16 0 006 6l.86-.86a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.67z"/>
                        </svg>
                        {bookerPhone}
                      </div>
                    )}
                    {bookerEmail && (
                      <div className="psp-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {bookerEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="psp-details-card">
                {/* Ticket ID */}
                <div className="psp-detail-item">
                  <div className="psp-detail-icon"><IconTicket /></div>
                  <div>
                    <div className="psp-detail-label">Ticket ID</div>
                    <div className="psp-detail-value" style={{ fontSize: 12 }}>{booking?.bookingId || '—'}</div>
                  </div>
                </div>
                {/* Amount */}
                <div className="psp-detail-item">
                  <div className="psp-detail-icon"><IconWallet /></div>
                  <div>
                    <div className="psp-detail-label">Amount</div>
                    <div className="psp-detail-value">₹{amount}</div>
                  </div>
                </div>
                {/* Date & Time */}
                <div className="psp-detail-item">
                  <div className="psp-detail-icon"><IconCalendar /></div>
                  <div>
                    <div className="psp-detail-label">Date & Time</div>
                    <div className="psp-detail-value" style={{ fontSize: 13 }}>
                      {bookingDate}<br />
                      <span style={{ fontWeight: 700, color: '#374151' }}>{timeDisplay}</span>
                    </div>
                  </div>
                </div>
                {/* Venue */}
                <div className="psp-detail-item">
                  <div className="psp-detail-icon"><IconMapPin /></div>
                  <div>
                    <div className="psp-detail-label">Venue</div>
                    <div className="psp-detail-value" style={{ fontSize: 13 }}>
                      EROTURF<br />
                      <span style={{ fontWeight: 700, color: '#374151' }}>Main Ground</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paid by card */}
              <div className="psp-paid-card">
                <div className="psp-upi-logo">UPI</div>
                <div className="psp-paid-info">
                  <div className="psp-paid-by-label">Paid by</div>
                  <div className="psp-paid-name">{bookerName}</div>
                  <div className="psp-paid-sub">
                    {paymentMethod === 'upi' && `UPI ID: ${upiId}`}
                    {paymentMethod === 'card' && `Card: •••• ${displayLast4}`}
                    {paymentMethod === 'netbanking' && 'Net Banking'}
                    {paymentMethod === 'wallet' && 'Wallet Payment'}
                  </div>
                </div>
                <div className="psp-paid-badge">
                  PAID
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              {/* Bottom tear line */}
              <div className="psp-tear-line-bottom" style={{ margin: '16px -24px 16px' }}>
                <div className="psp-tear-notch-bl" style={{ background: '#111A13' }} />
                <div className="psp-tear-notch-br" style={{ background: '#111A13' }} />
              </div>

              {/* Barcode */}
              <div className="psp-barcode-card">
                <BarcodeSVG value={booking?.bookingId || 'ERT-TICKET'} />
              </div>

            </div>

            {/* Bottom notch row */}
            <div className="psp-ticket-footer">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="psp-bottom-notch" />
              ))}
            </div>
          </motion.div>

          {/* ── ACTION BUTTONS ── */}
          <motion.div
            className="psp-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <button className="psp-action-btn download" onClick={downloadTicket}>
              <IconDownload />
              Download<br />Ticket
            </button>
            <button className="psp-action-btn share" onClick={handleShare}>
              <IconShare />
              Share<br />Ticket
            </button>
            <button className="psp-action-btn bookings" onClick={() => navigate('/dashboard')}>
              <IconBookings />
              My<br />Bookings
            </button>
            <button className="psp-action-btn home" onClick={() => navigate('/')}>
              <IconHome />
              Back to<br />Home
            </button>
          </motion.div>

          {/* Footer notice */}
          <div className="psp-notice">
            <IconShield />
            Keep this ticket safe. Show it at the venue.
          </div>

        </div>
      </div>
    </>
  );
}
