import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createRazorpayOrder, verifyRazorpayPayment, cancelBooking } from '../services/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   INLINE SVG ICONS
───────────────────────────────────────────── */
const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
const IconUPI = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
    <path d="M12 2L4 12l3 1-3 9 14-11-4-1 4-9z" />
  </svg>
);
const IconBank = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
  </svg>
);
const IconWallet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path d="M16 3.13a4 4 0 010 7.75" />
    <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ width: 12, height: 12 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ─────────────────────────────────────────────
   PAYMENT PAGE COMPONENT
───────────────────────────────────────────── */
export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(600);
  const [activeTab, setActiveTab] = useState('card');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  // UPI form
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Net banking
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [customerId, setCustomerId] = useState('');
  const [netbankingPassword, setNetbankingPassword] = useState('');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  // Demo / fallback data for preview when no router state is present
  const DEMO_TURF = {
    _id: 'demo',
    name: 'EROTURF — Main Ground',
    location: { address: '123 Sports Complex, ECR Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600119' },
    rating: 4.8,
  };
  const DEMO_BOOKINGS = [{
    bookingId: 'DEMO001',
    date: new Date().toISOString(),
    slots: ['06:00 PM', '07:00 PM', '08:00 PM'],
    slot: '06:00 PM, 07:00 PM, 08:00 PM',
    session: 'evening',
    pricing: { slotPrice: 3000, gst: 0, total: 3000 },
    user: { name: 'Demo User', email: 'demo@eroturf.com', phone: '' },
  }];

  const { bookings, turf, totalAmount, bookingIdsParam } = state || {};
  const allBookings = bookings?.length ? bookings : DEMO_BOOKINGS;
  const activeTurf = turf || DEMO_TURF;
  const isDemo = !turf;
  const [phone, setPhone] = useState(bookings?.[0]?.user?.phone || '');
  const paymentCompleted = useRef(false);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error('Payment session expired. Please book again.');
      navigate('/book');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  useEffect(() => {
    return () => {
      if (!paymentCompleted.current && bookingIdsParam) {
        bookingIdsParam.split(',').forEach(id =>
          cancelBooking(id).catch(err => console.warn('Auto-cancel failed', id, err))
        );
      }
    };
  }, [bookingIdsParam]);

  /* handlers */
  const handleCardNumberChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(v.replace(/(\d{4})(?=\d)/g, '$1 '));
  };
  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardExpiry(v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v);
  };
  const handleCvvChange = (e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4));

  const detectCardType = (num) => {
    const n = num.replace(/\D/g, '');
    if (/^4/.test(n)) return 'visa';
    if (/^5[1-5]/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    if (/^65/.test(n) || /^508/.test(n)) return 'rupay';
    return null;
  };

  const validateInputs = () => {
    if (activeTab === 'card') {
      if (cardNumber.replace(/\D/g, '').length < 16) { toast.error('Enter a valid 16-digit card number'); return false; }
      if (cardExpiry.replace(/\D/g, '').length < 4) { toast.error('Enter expiry date MM / YY'); return false; }
      const m = parseInt(cardExpiry.replace(/\D/g, '').slice(0, 2));
      if (m < 1 || m > 12) { toast.error('Enter a valid month 01–12'); return false; }
      if (cardCvv.length < 3) { toast.error('Enter a valid CVV'); return false; }
      if (!cardName.trim()) { toast.error('Enter cardholder name'); return false; }
    } else if (activeTab === 'upi') {
      if (!upiId.includes('@') || upiId.trim().length < 5) { toast.error('Enter a valid UPI ID'); return false; }
    } else if (activeTab === 'netbanking') {
      if (!customerId.trim()) { toast.error('Enter Customer ID'); return false; }
    }
    return true;
  };

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true); setLoadingStep('validating');
    try {
      const { data } = await createRazorpayOrder({ bookingId: bookingIdsParam });
      if (!data.success || !data.order) throw new Error('Failed to retrieve order ID');
      setLoadingStep('contacting');
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'EroTurf',
        description: 'Secure Booking Fee Payment',
        order_id: data.order.id,
        handler: async function (response) {
          try {
            setLoading(true); setLoadingStep('securing');
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingIdsParam,
            });
            if (verifyRes.data.success) {
              paymentCompleted.current = true;
              setLoadingStep('complete');
              await new Promise(r => setTimeout(r, 600));
              toast.success('✅ Payment verified and confirmed!');
              const last4 = activeTab === 'card' ? cardNumber.replace(/\D/g, '').slice(-4) : '';
              navigate('/payment/success', {
                state: {
                  bookings: verifyRes.data.bookings || allBookings,
                  turf, devMode: false,
                  paymentMethod: activeTab,
                  cardLast4: last4,
                  phone,
                },
              });
            } else throw new Error('Verification failed');
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Payment verification failed.');
          } finally { setLoading(false); setLoadingStep(''); }
        },
        prefill: {
          name: allBookings[0]?.user?.name || '',
          email: allBookings[0]?.user?.email || '',
          contact: phone || '0000000000',
        },
        theme: { color: '#00C853' },
        modal: { ondismiss: () => { setLoading(false); setLoadingStep(''); toast.error('Payment cancelled.'); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Payment initiation failed.');
      setLoading(false); setLoadingStep('');
    }
  };

  const cardBrand = detectCardType(cardNumber);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isUrgent = timeLeft < 120;
  const displayAmount = totalAmount || allBookings.reduce((s, b) => s + (b.pricing?.total || 0), 0);
  // Use activeTurf instead of turf throughout the render
  const turfData = activeTurf;

  const paymentMethods = [
    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: <IconCard /> },
    { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm', icon: <IconUPI /> },
    { id: 'netbanking', label: 'Net Banking', sub: 'All major banks', icon: <IconBank /> },
    { id: 'wallet', label: 'Wallet', sub: 'Paytm, Amazon Pay', icon: <IconWallet /> },
  ];

  const upiApps = [
    { id: 'gpay', name: 'GPay', color: '#4285F4', initials: 'GP' },
    { id: 'phonepe', name: 'PhonePe', color: '#5F259F', initials: 'PP' },
    { id: 'paytm', name: 'Paytm', color: '#00BAF2', initials: 'PT' },
    { id: 'bhim', name: 'BHIM', color: '#00509E', initials: 'BH' },
  ];

  const banks = [
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'sbi', name: 'SBI' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Bank' },
    { id: 'pnb', name: 'Punjab National Bank' },
  ];

  const wallets = [
    { id: 'paytm', name: 'Paytm', color: '#00BAF2' },
    { id: 'amazon', name: 'Amazon Pay', color: '#FF9900' },
    { id: 'mobikwik', name: 'MobiKwik', color: '#6B3FA0' },
    { id: 'freecharge', name: 'FreeCharge', color: '#EF4444' },
  ];

  /* slot display helpers */
  const allSlotTimes = allBookings.flatMap(b =>
    Array.isArray(b.slots) ? b.slots : (b.slot ? b.slot.split(', ') : [])
  );
  const bookingDate = allBookings[0]?.date
    ? new Date(allBookings[0].date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Selected Date';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .pp-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background: #F0F4F8;
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .pp-header {
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pp-logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pp-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        .pp-brand {
          font-weight: 900;
          font-style: italic;
          font-size: 20px;
          letter-spacing: -0.4px;
          line-height: 1;
        }

        .pp-divider-v {
          width: 1px;
          height: 18px;
          background: #E5E7EB;
        }

        .pp-back-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6B7280;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          font-family: inherit;
          padding: 0;
          transition: color 0.15s;
        }
        .pp-back-btn:hover { color: #111827; }

        .pp-secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 999px;
          padding: 6px 14px;
        }

        .pp-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 999px;
          padding: 6px 14px;
          transition: all 0.3s;
        }
        .pp-timer.normal { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
        .pp-timer.urgent { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

        /* ── MAIN GRID ── */
        .pp-page-title {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 24px 0;
        }
        .pp-page-title h1 {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }
        .pp-page-title p {
          margin: 6px 0 0;
          font-size: 14px;
          color: #6B7280;
        }

        .pp-main {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 20px 24px 40px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (min-width: 900px) {
          .pp-main {
            grid-template-columns: 1fr 360px;
          }
        }

        /* ── LEFT COLUMN ── */
        .pp-left { display: flex; flex-direction: column; gap: 20px; }

        /* ── PAYMENT METHOD SELECTOR ── */
        .pp-section-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .pp-section-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9CA3AF;
          margin-bottom: 16px;
        }

        .pp-method-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 600px) {
          .pp-method-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .pp-method-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 8px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          text-align: center;
        }
        .pp-method-btn:hover:not(.active) {
          border-color: #D1D5DB;
          background: #F9FAFB;
        }
        .pp-method-btn.active {
          border-color: #00C853;
          background: #F0FDF4;
        }

        .pp-method-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F3F4F6;
          color: #6B7280;
          transition: all 0.15s;
        }
        .pp-method-btn.active .pp-method-icon {
          background: #DCFCE7;
          color: #00C853;
        }
        .pp-method-name {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          transition: color 0.15s;
        }
        .pp-method-btn.active .pp-method-name { color: #16a34a; }
        .pp-method-sub {
          font-size: 10px;
          color: #9CA3AF;
          font-weight: 500;
        }

        /* ── FORM CARD ── */
        .pp-form-section-label {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 4px;
          letter-spacing: 0.01em;
        }

        .pp-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 14px;
        }
        .pp-field label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }
        .pp-input {
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          background: #F9FAFB;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          width: 100%;
          font-family: inherit;
        }
        .pp-input::placeholder { color: #9CA3AF; font-weight: 400; }
        .pp-input:focus {
          border-color: #00C853;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.12);
        }

        .pp-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .pp-divider { height: 1px; background: #F3F4F6; margin: 14px 0; }

        /* Save card checkbox */
        .pp-save-card {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          margin-top: 4px;
        }
        .pp-save-card input { width: 16px; height: 16px; accent-color: #00C853; cursor: pointer; }
        .pp-save-card span { font-size: 13px; font-weight: 500; color: #374151; }

        /* UPI app grid */
        .pp-upi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .pp-upi-app {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 6px;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          background: #F9FAFB;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pp-upi-app.selected { border-color: #00C853; background: #F0FDF4; color: #16a34a; }
        .pp-upi-app:not(.selected):hover { background: #F3F4F6; }

        .pp-upi-info {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 13px;
          color: #16a34a;
          font-weight: 500;
          line-height: 1.6;
        }

        /* Bank select */
        .pp-select {
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          background: #F9FAFB;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          font-family: inherit;
          cursor: pointer;
          margin-bottom: 14px;
        }
        .pp-select:focus { border-color: #00C853; }

        /* Wallet grid */
        .pp-wallet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .pp-wallet-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          background: #F9FAFB;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pp-wallet-btn.selected { border-color: #00C853; background: #F0FDF4; color: #16a34a; }

        /* PAY BUTTON */
        .pp-pay-btn {
          width: 100%;
          background: linear-gradient(135deg, #00C853, #009624);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.15s;
          font-family: inherit;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(0, 200, 83, 0.3);
          margin-top: 4px;
        }
        .pp-pay-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #00B24A, #007A1E);
          box-shadow: 0 6px 24px rgba(0, 200, 83, 0.45);
          transform: translateY(-1px);
        }
        .pp-pay-btn:active:not(:disabled) { transform: translateY(0); }
        .pp-pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ── RIGHT SUMMARY CARD ── */
        .pp-summary {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          position: sticky;
          top: 80px;
        }

        .pp-summary-header {
          background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%);
          padding: 22px 24px;
          position: relative;
          overflow: hidden;
        }
        .pp-summary-header::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 100px; height: 100px;
          background: radial-gradient(circle, rgba(0,200,83,0.2) 0%, transparent 70%);
          border-radius: 50%;
        }
        .pp-summary-header::after {
          content: '';
          position: absolute;
          bottom: -20px; left: 20px;
          width: 80px; height: 80px;
          background: radial-gradient(circle, rgba(0,200,83,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .pp-summary-turf-name {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 2px;
        }
        .pp-summary-turf-addr {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 16px;
        }
        .pp-summary-rating {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(0,200,83,0.2);
          border: 1px solid rgba(0,200,83,0.3);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 700;
          color: #4ade80;
        }

        .pp-summary-body { padding: 20px 24px; }

        .pp-slot-chip {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          border-radius: 6px;
          padding: 3px 8px;
          margin: 2px;
        }

        .pp-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #6B7280;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .pp-price-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 2px solid #F3F4F6;
          margin-top: 4px;
        }

        .pp-total-label { font-size: 14px; font-weight: 700; color: #111827; }
        .pp-total-amount {
          font-size: 28px;
          font-weight: 900;
          color: #00C853;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .pp-trust-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #9CA3AF;
          font-weight: 600;
          padding: 16px 24px;
          border-top: 1px solid #F3F4F6;
          background: #FAFAFA;
        }

        .pp-brands {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 0 24px 16px;
          border-bottom: 1px solid #F3F4F6;
        }
        .pp-brand-pill {
          padding: 3px 8px;
          border: 1px solid #E5E7EB;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          color: #6B7280;
          background: #fff;
        }

        /* Loading overlay */
        .pp-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .pp-spinner {
          width: 48px; height: 48px;
          border: 4px solid #E5E7EB;
          border-top-color: #00C853;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Card visual */
        .pp-card-visual {
          background: linear-gradient(135deg, #1e3a5f 0%, #0f2747 100%);
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          min-height: 120px;
        }
        .pp-card-visual::before {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 100px; height: 100px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
        }
        .pp-card-chip {
          width: 36px; height: 28px;
          background: linear-gradient(135deg, #f0c040, #c8960c);
          border-radius: 5px;
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 2px;
          padding: 3px;
        }
        .pp-card-chip span {
          background: rgba(0,0,0,0.2);
          border-radius: 1px;
        }
        .pp-card-number-display {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .pp-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .pp-card-meta-label { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
        .pp-card-meta-value { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); }

        @media (max-width: 600px) {
          .pp-header { padding: 12px 16px; }
          .pp-page-title { padding: 20px 16px 0; }
          .pp-main { padding: 16px 16px 32px; }
          .pp-section-card { padding: 18px; }
          .pp-summary-body { padding: 16px; }
          .pp-summary-header { padding: 18px; }
          .pp-grid-2 { grid-template-columns: 1fr; }
          .pp-upi-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* LOADING OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="pp-loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pp-spinner" />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
              {loadingStep === 'validating' && 'Validating payment details...'}
              {loadingStep === 'contacting' && 'Connecting to payment gateway...'}
              {loadingStep === 'securing' && 'Verifying & securing your booking...'}
              {loadingStep === 'complete' && '✅ Payment confirmed!'}
              {!loadingStep && 'Processing...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pp-root">

        {/* ── HEADER ── */}
        <header className="pp-header">
          <div className="pp-logo-wrap">
            {/* EroTurf Logo */}
            <div className="pp-logo">
              <svg width="42" height="15" viewBox="0 0 100 35" fill="none">
                <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <span className="pp-brand">
                <span style={{ color: '#0F172A' }}>Ero</span><span style={{ color: '#00C853' }}>Turf</span>
              </span>
            </div>

            <div className="pp-divider-v" />

            <button className="pp-back-btn" onClick={() => navigate(-1)}>
              <IconChevronLeft />
              Back to Booking
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Countdown */}
            <div className={`pp-timer ${isUrgent ? 'urgent' : 'normal'}`}>
              <IconClock />
              {mins}:{secs}
            </div>

            {/* Secure badge */}
            <div className="pp-secure-badge">
              <IconLock />
              100% Secure
            </div>
          </div>
        </header>

        {/* ── PAGE TITLE ── */}
        <div className="pp-page-title">
          <h1>Complete Your Payment</h1>
          <p>Choose a payment method and confirm your turf booking</p>
        </div>

        {/* ── MAIN CONTENT ── */}
        <main className="pp-main">

          {/* ── LEFT COLUMN ── */}
          <div className="pp-left">

            {/* STEP 1: Choose Method */}
            <div className="pp-section-card">
              <div className="pp-section-label">Step 1 — Select Payment Method</div>
              <div className="pp-method-grid">
                {paymentMethods.map(m => (
                  <button
                    key={m.id}
                    className={`pp-method-btn ${activeTab === m.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(m.id)}
                    type="button"
                  >
                    <div className="pp-method-icon">{m.icon}</div>
                    <div className="pp-method-name">{m.label}</div>
                    <div className="pp-method-sub">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: Enter Details */}
            <div className="pp-section-card">
              <div className="pp-section-label">Step 2 — Enter Payment Details</div>

              {/* Mobile Number */}
              <div className="pp-field">
                <label>📱 Mobile Number (for ticket)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="pp-input"
                />
              </div>
              <div className="pp-divider" />

              <AnimatePresence mode="wait">

                {/* ── CARD FORM ── */}
                {activeTab === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Card Visual Preview */}
                    <div className="pp-card-visual">
                      <div className="pp-card-chip">
                        <span /><span /><span /><span />
                      </div>
                      <div className="pp-card-number-display">
                        {cardNumber
                          ? cardNumber.padEnd(19, ' ').replace(/(.{5})/g, '$1').trim()
                          : '•••• •••• •••• ••••'}
                      </div>
                      <div className="pp-card-meta">
                        <div>
                          <div className="pp-card-meta-label">Card Holder</div>
                          <div className="pp-card-meta-value">{cardName || 'YOUR NAME'}</div>
                        </div>
                        <div>
                          <div className="pp-card-meta-label">Expires</div>
                          <div className="pp-card-meta-value">{cardExpiry || 'MM / YY'}</div>
                        </div>
                        {/* Brand indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {cardBrand === 'visa' && (
                            <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: 16, color: '#fff', letterSpacing: '-0.5px' }}>VISA</span>
                          )}
                          {cardBrand === 'mastercard' && (
                            <div style={{ position: 'relative', width: 30, height: 20 }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20, borderRadius: '50%', background: '#EB001B', opacity: 0.9 }} />
                              <div style={{ position: 'absolute', right: 0, top: 0, width: 20, height: 20, borderRadius: '50%', background: '#F79E1B', opacity: 0.9 }} />
                            </div>
                          )}
                          {cardBrand === 'rupay' && (
                            <span style={{ fontWeight: 900, fontStyle: 'italic', fontSize: 12, color: '#fff' }}>RuPay</span>
                          )}
                          {!cardBrand && (
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Card</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="pp-field">
                      <label>Card Number</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="pp-input"
                          style={{ paddingRight: 80 }}
                        />
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 900, fontStyle: 'italic', color: cardBrand === 'visa' ? '#1a1f71' : '#D1D5DB' }}>VISA</span>
                          <div style={{ position: 'relative', width: 18, height: 12 }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, width: 12, height: 12, borderRadius: '50%', background: cardBrand === 'mastercard' ? '#EB001B' : '#D1D5DB' }} />
                            <div style={{ position: 'absolute', right: 0, top: 0, width: 12, height: 12, borderRadius: '50%', background: cardBrand === 'mastercard' ? '#F79E1B' : '#D1D5DB', opacity: 0.85 }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Name + Expiry */}
                    <div className="pp-grid-2">
                      <div className="pp-field" style={{ marginBottom: 0 }}>
                        <label>Cardholder Name</label>
                        <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name on card" className="pp-input" />
                      </div>
                      <div className="pp-field" style={{ marginBottom: 0 }}>
                        <label>Expiry Date</label>
                        <input type="text" value={cardExpiry} onChange={handleExpiryChange} placeholder="MM / YY" className="pp-input" maxLength={7} style={{ textAlign: 'center' }} />
                      </div>
                    </div>

                    {/* CVV */}
                    <div className="pp-grid-2" style={{ marginTop: 14 }}>
                      <div className="pp-field" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          CVV
                          <span title="3-digit code on back of card" style={{ color: '#9CA3AF', cursor: 'help', display: 'flex' }}><IconInfo /></span>
                        </label>
                        <input type="password" value={cardCvv} onChange={handleCvvChange} placeholder="•••" className="pp-input" maxLength={4} style={{ textAlign: 'center', letterSpacing: '4px' }} />
                      </div>
                      <div className="pp-field" style={{ marginBottom: 0 }}>
                        <label style={{ visibility: 'hidden' }}>_</label>
                        <div style={{
                          height: 44, border: '1.5px solid #E5E7EB', borderRadius: 10,
                          background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                          paddingRight: 12, position: 'relative', overflow: 'hidden',
                        }}>
                          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 8, background: '#6B7280', opacity: 0.3 }} />
                          <div style={{ width: 38, height: 18, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#EB001B', fontFamily: 'monospace' }}>
                            {cardCvv ? cardCvv.replace(/./g, '•') : '123'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <label className="pp-save-card">
                        <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                        <span>Save this card for future payments</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* ── UPI FORM ── */}
                {activeTab === 'upi' && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pp-field">
                      <label>UPI ID / VPA</label>
                      <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@okaxis" className="pp-input" />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label className="pp-form-section-label">Or select app</label>
                      <div className="pp-upi-grid" style={{ marginTop: 8 }}>
                        {upiApps.map(app => (
                          <button
                            key={app.id}
                            type="button"
                            className={`pp-upi-app ${selectedUpiApp === app.id ? 'selected' : ''}`}
                            onClick={() => setSelectedUpiApp(app.id)}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: app.color + '22', color: app.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, fontSize: 11,
                            }}>
                              {app.initials}
                            </div>
                            {app.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pp-upi-info">
                      A payment request will be sent to your UPI app after clicking Pay. Open your app to approve.
                    </div>
                  </motion.div>
                )}

                {/* ── NET BANKING ── */}
                {activeTab === 'netbanking' && (
                  <motion.div
                    key="netbanking"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pp-field">
                      <label>Select Bank</label>
                      <select
                        className="pp-select"
                        value={selectedBank}
                        onChange={e => setSelectedBank(e.target.value)}
                      >
                        {banks.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pp-field">
                      <label>Customer ID / User ID</label>
                      <input type="text" value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="Enter customer ID" className="pp-input" />
                    </div>
                    <div className="pp-field">
                      <label>Net Banking Password</label>
                      <input type="password" value={netbankingPassword} onChange={e => setNetbankingPassword(e.target.value)} placeholder="Enter password" className="pp-input" />
                    </div>
                    <div className="pp-upi-info">
                      You will be redirected to your bank's secure portal to complete the transaction.
                    </div>
                  </motion.div>
                )}

                {/* ── WALLET ── */}
                {activeTab === 'wallet' && (
                  <motion.div
                    key="wallet"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pp-form-section-label" style={{ marginBottom: 12 }}>Select Wallet</div>
                    <div className="pp-wallet-grid">
                      {wallets.map(w => (
                        <button
                          key={w.id}
                          type="button"
                          className={`pp-wallet-btn ${selectedWallet === w.id ? 'selected' : ''}`}
                          onClick={() => setSelectedWallet(w.id)}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: w.color + '22', color: w.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 10, flexShrink: 0,
                          }}>
                            {w.name.slice(0, 2).toUpperCase()}
                          </div>
                          {w.name}
                        </button>
                      ))}
                    </div>
                    <div className="pp-upi-info" style={{ marginTop: 16 }}>
                      Your wallet balance will be debited instantly on confirmation.
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

              {/* PAY BUTTON */}
              <div style={{ marginTop: 24 }}>
                <button
                  className="pp-pay-btn"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <>
                      <IconLock />
                      Pay ₹{displayAmount.toLocaleString('en-IN')} Securely
                    </>
                  )}
                </button>
              </div>

              {/* Trust badges row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: '🔒', text: 'SSL Encrypted' },
                  { icon: '✅', text: 'RBI Compliant' },
                  { icon: '🛡️', text: 'PCI DSS Secure' },
                ].map(t => (
                  <span key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
                    <span>{t.icon}</span>{t.text}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT SUMMARY CARD ── */}
          <div className="pp-summary">

            {/* Dark Header */}
            <div className="pp-summary-header">
              {isDemo && (
                <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 6, padding: '2px 8px', marginBottom: 8, display: 'inline-block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Preview Mode
                </div>
              )}
              <div className="pp-summary-turf-name">{turfData?.name || 'EROTURF - Main Ground'}</div>
              <div className="pp-summary-turf-addr">
                <IconMapPin />
                {turfData?.location?.city || 'Chennai'}, {turfData?.location?.state || 'Tamil Nadu'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pp-summary-rating">
                  <IconStar />
                  {turfData?.rating || '4.8'} Rating
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>•</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  {allBookings.length} booking{allBookings.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Accepted Methods */}
            <div className="pp-brands">
              <div style={{ width: '100%', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, paddingTop: 10 }}>
                Accepted Payments
              </div>
              {['VISA', 'Mastercard', 'RuPay', 'UPI', 'Paytm', 'GPay', 'PhonePe'].map(b => (
                <span key={b} className="pp-brand-pill">{b}</span>
              ))}
            </div>

            {/* Booking Details */}
            <div className="pp-summary-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 10 }}>
                  Booking Details
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                    📅
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 1 }}>{bookingDate}</div>
                  </div>
                </div>

                {/* Slots */}
                {allSlotTimes.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                      🕐
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Time Slots ({allSlotTimes.length})
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {allSlotTimes.slice(0, 6).map(t => (
                          <span key={t} className="pp-slot-chip">{t}</span>
                        ))}
                        {allSlotTimes.length > 6 && (
                          <span className="pp-slot-chip">+{allSlotTimes.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Session */}
                {allBookings[0]?.session && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                      🌅
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginTop: 1, textTransform: 'capitalize' }}>{allBookings[0].session}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pp-divider" />

              {/* Price Breakdown */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 10 }}>
                  Price Breakdown
                </div>

                {allBookings.map((b, idx) => (
                  <div key={idx} className="pp-price-row">
                    <span>
                      {allBookings.length > 1 ? `Booking ${idx + 1} — ` : ''}
                      {Array.isArray(b.slots) ? b.slots.length : 1} slot{(Array.isArray(b.slots) ? b.slots.length : 1) > 1 ? 's' : ''}
                    </span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>₹{(b.pricing?.slotPrice || b.pricing?.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                {allBookings[0]?.pricing?.gst > 0 && (
                  <div className="pp-price-row">
                    <span>GST</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>₹{allBookings.reduce((s, b) => s + (b.pricing?.gst || 0), 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pp-price-total-row">
                <span className="pp-total-label">Total Payable</span>
                <span className="pp-total-amount">₹{displayAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust footer */}
            <div className="pp-trust-row">
              <IconShield />
              <span>Powered by Razorpay — 256-bit SSL</span>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
