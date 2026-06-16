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

const SvgVisa = ({ style }) => (
  <svg width="32" height="10" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M13.56 11.64H16.4L18.17 2.22H15.33L13.56 11.64ZM23.36 2.37C22.75 2.13 21.84 1.93 20.76 1.93C17.75 1.93 15.63 3.48 15.61 5.7C15.59 7.35 17.13 8.27 18.28 8.81C19.46 9.37 19.86 9.72 19.85 10.22C19.84 10.99 18.9 11.31 18.06 11.31C17.1 11.31 16.31 11.08 15.54 10.74L15.15 12.51C15.65 12.74 16.74 12.94 17.87 12.94C21.03 12.94 23.11 11.42 23.14 9.07C23.16 7.15 21.94 6.32 20.44 5.62C19.46 5.15 19.03 4.8 19.04 4.35C19.04 3.73 19.78 3.51 20.49 3.51C21.37 3.49 22.08 3.69 22.58 3.91L23.36 2.37ZM30.68 2.22H28.49C27.82 2.22 27.28 2.6 27.01 3.23L22.95 12.63H25.93L26.53 11.02H30.18L30.52 12.63H33.15L30.68 2.22ZM27.35 8.86C27.52 8.41 28.18 6.64 28.18 6.64C28.18 6.64 28.52 7.74 28.71 8.86H27.35ZM10.42 2.22L7.69 12.63H4.85L2.24 3.72C2.07 3.12 1.62 2.69 1.05 2.38V2.22H5.66C6.31 2.22 6.89 2.63 7.03 3.27L8.22 9.49L10.42 2.22Z" fill="#1A1F71" />
  </svg>
);

const SvgMastercard = ({ style }) => (
  <svg width="24" height="15" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <circle cx="7.5" cy="7.5" r="7.5" fill="#EB001B" />
    <circle cx="16.5" cy="7.5" r="7.5" fill="#F79E1B" fillOpacity="0.8" />
  </svg>
);

const SvgRuPay = ({ style }) => (
  <svg width="36" height="10" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <text x="0" y="10" fill="#0A3A82" fontSize="9" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">Ru</text>
    <text x="11" y="10" fill="#E86E25" fontSize="9" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">Pay</text>
    <path d="M28 2 L31 6 L28 10" stroke="#0BA85A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          background: #F8FAFC;
          display: flex;
          flex-direction: column;
          color: #0F172A;
        }

        /* ── HEADER ── */
        .pp-header {
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .pp-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .pp-brand {
          font-size: 22px;
          font-weight: 800;
          font-style: italic;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pp-divider-v {
          width: 1px;
          height: 20px;
          background: #E2E8F0;
        }

        .pp-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2563EB;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          font-family: inherit;
          padding: 0;
          transition: color 0.15s;
        }
        .pp-back-btn:hover {
          color: #1D4ED8;
          text-decoration: underline;
        }

        .pp-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pp-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 999px;
          padding: 6px 14px;
        }
        .pp-timer.normal { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
        .pp-timer.urgent { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

        .pp-secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 999px;
          padding: 6px 14px;
        }

        /* ── PAGE TITLE SECTION ── */
        .pp-title-section {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 40px 0;
        }
        .pp-title-section h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }
        .pp-title-section p {
          margin: 6px 0 0;
          font-size: 15px;
          color: #64748B;
        }

        /* ── MAIN CONTENT GRID ── */
        .pp-main-grid {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 40px 60px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (min-width: 960px) {
          .pp-main-grid {
            grid-template-columns: 1fr 380px;
          }
        }

        .pp-card-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
        }

        /* ── LEFT COLUMN ── */
        .pp-left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── RIGHT COLUMN ── */
        .pp-right-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .pp-payment-methods-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .pp-payment-methods-grid {
            grid-template-columns: 280px 1fr;
          }
        }

        .pp-tabs-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pp-tab-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease-in-out;
          font-family: inherit;
          width: 100%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .pp-tab-card:hover:not(.active) {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }
        .pp-tab-card.active {
          border-color: #2563EB;
          box-shadow: 0 0 0 1px #2563EB;
        }

        .pp-tab-card-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pp-tab-card-icon {
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .pp-tab-card.active .pp-tab-card-icon {
          color: #2563EB;
        }

        .pp-tab-card-info {
          display: flex;
          flex-direction: column;
        }
        .pp-tab-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }
        .pp-tab-card-desc {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
          margin-top: 2px;
        }

        .pp-tab-card-indicator {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          flex-shrink: 0;
          background: transparent;
        }
        .pp-tab-card-indicator.active {
          border-color: #2563EB;
          background: #2563EB;
          color: #fff;
        }

        .pp-form-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .pp-form-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 20px;
        }

        .pp-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .pp-field label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .pp-input-wrap {
          position: relative;
        }

        .pp-input {
          width: 100%;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #0F172A;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .pp-input::placeholder {
          color: #94A3B8;
          font-weight: 400;
        }
        .pp-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .pp-input-logos {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 8px;
          align-items: center;
          pointer-events: none;
        }

        .pp-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Checkbox */
        .pp-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          color: #334155;
          user-select: none;
          margin-top: 4px;
        }
        .pp-checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: #2563EB;
          cursor: pointer;
        }

        /* Card helper graphic */
        .pp-card-back-helper {
          height: 48px;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          background: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          position: relative;
          overflow: hidden;
        }
        .pp-card-back-strip {
          position: absolute;
          top: 8px;
          left: 0;
          right: 0;
          height: 10px;
          background: #475569;
          opacity: 0.8;
        }
        .pp-card-back-signature {
          position: absolute;
          top: 22px;
          left: 8px;
          right: 48px;
          height: 12px;
          background: #E2E8F0;
        }
        .pp-cvv-preview {
          width: 32px;
          height: 16px;
          background: #fff;
          border: 1px solid #DC2626;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: #DC2626;
          font-family: monospace;
          z-index: 2;
        }

        /* UPI apps grid */
        .pp-upi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .pp-upi-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 8px;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          background: #F8FAFC;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          font-family: inherit;
          transition: all 0.15s;
        }
        .pp-upi-btn.selected {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #2563EB;
        }
        .pp-upi-btn:not(.selected):hover {
          background: #F1F5F9;
        }

        .pp-info-alert {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 8px;
          padding: 14px 16px;
          font-size: 13px;
          color: #1E40AF;
          font-weight: 500;
          line-height: 1.5;
        }

        /* Net Banking Bank select */
        .pp-select {
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 500;
          color: #0F172A;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          font-family: inherit;
          cursor: pointer;
        }
        .pp-select:focus {
          border-color: #2563EB;
        }

        /* Wallet grid */
        .pp-wallet-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .pp-wallet-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: 1.5px solid #E2E8F0;
          border-radius: 8px;
          background: #F8FAFC;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          color: #334155;
          font-family: inherit;
          transition: all 0.15s;
          text-align: left;
        }
        .pp-wallet-btn.selected {
          border-color: #2563EB;
          background: #EFF6FF;
          color: #2563EB;
        }

        /* Pay Button Wrapper */
        .pp-pay-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .pp-pay-btn {
          width: 100%;
          background: #2563EB;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 16px 24px;
          font-size: 16.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        .pp-pay-btn:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
        }
        .pp-pay-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .pp-pay-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .pp-agree-text {
          font-size: 12.5px;
          color: #64748B;
          text-align: center;
          font-weight: 500;
          line-height: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pp-agree-text a {
          color: #2563EB;
          text-decoration: none;
          font-weight: 600;
        }
        .pp-agree-text a:hover {
          text-decoration: underline;
        }

        /* ── RIGHT COLUMN: ORDER SUMMARY ── */
        .pp-summary-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .pp-summary-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 20px;
        }

        /* Turf item details */
        .pp-turf-item {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .pp-turf-img {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
          background: #F1F5F9;
          flex-shrink: 0;
        }
        .pp-turf-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .pp-turf-name {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pp-turf-sub {
          font-size: 12.5px;
          color: #64748B;
          font-weight: 500;
          margin-top: 2px;
        }

        .pp-section-divider {
          height: 1px;
          background: #E2E8F0;
          margin: 20px 0;
        }

        /* Price Details list */
        .pp-price-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pp-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #64748B;
          font-weight: 500;
        }
        .pp-price-row.discount {
          color: #16A34A;
        }
        .pp-price-row.delivery {
          color: #16A34A;
        }
        .pp-price-total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 4px;
        }
        .pp-total-label {
          font-size: 15px;
          font-weight: 700;
          color: #0F172A;
        }
        .pp-total-wrap {
          text-align: right;
        }
        .pp-total-amount {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.5px;
        }
        .pp-total-subtext {
          font-size: 11.5px;
          color: #94A3B8;
          font-weight: 500;
          margin-top: 1px;
        }

        /* Trust Badges below summary card */
        .pp-trust-badges {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
        }
        .pp-trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pp-trust-badge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
        }
        .pp-trust-badge-text {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          line-height: 1.2;
        }

        /* ── FOOTER: ACCEPT BRANDS STRIP ── */
        .pp-footer {
          border-top: 1px solid #E2E8F0;
          background: #fff;
          padding: 30px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: auto;
        }
        .pp-footer-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94A3B8;
        }
        .pp-brand-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 16px 24px;
        }
        .pp-brand-logo {
          font-size: 12.5px;
          font-weight: 800;
          font-style: italic;
          color: #94A3B8;
          letter-spacing: -0.3px;
        }
        .pp-brand-logo.visa { color: #1A1F71; font-size: 16px; }
        .pp-brand-logo.mastercard { color: #374151; font-size: 15px; font-weight: 900; }
        .pp-brand-logo.rupay { color: #005A9C; font-size: 13.5px; }
        .pp-brand-logo.upi { color: #097939; font-size: 13.5px; }
        .pp-brand-logo.paytm { color: #00BAF2; font-size: 14px; }
        .pp-brand-logo.gpay { color: #4285F4; font-size: 13.5px; }
        .pp-brand-logo.phonepe { color: #5F259F; font-size: 13.5px; }

        @media (max-width: 640px) {
          .pp-header { padding: 14px 20px; }
          .pp-title-section { padding: 24px 20px 0; }
          .pp-main-grid { padding: 16px 20px 40px; gap: 24px; }
          .pp-payment-methods-grid { grid-template-columns: 1fr; gap: 16px; }
          .pp-form-card { padding: 20px; }
          .pp-upi-grid { grid-template-columns: repeat(2, 1fr); }
          .pp-footer { padding: 20px; }
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
          border-top-color: #2563EB;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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
          <div className="pp-header-left">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="42" height="15" viewBox="0 0 100 35" fill="none">
                <path d="M22 18 L22 13 M42 12 L42 7 M58 12 L58 7 M78 18 L78 13" stroke="#00C853" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M10 28 C 30 11, 70 11, 90 28" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M18 22 C 34 6, 66 6, 82 22" stroke="#00C853" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <span className="pp-brand" style={{ fontFamily: 'var(--font-brand)', fontWeight: 900 }}>
                <span style={{ color: '#0F172A' }}>Ero</span><span style={{ color: '#00C853' }}>Turf</span>
              </span>
            </div>

            <div className="pp-divider-v" />

            <button className="pp-back-btn" onClick={() => navigate(-1)}>
              <IconChevronLeft />
              Back to Booking
            </button>
          </div>

          <div className="pp-header-right">
            {/* Countdown */}
            <div className={`pp-timer ${isUrgent ? 'urgent' : 'normal'}`}>
              <IconClock />
              {mins}:{secs}
            </div>

            {/* Secure badge */}
            <div className="pp-secure-badge">
              <IconLock />
              100% Secure Checkout
            </div>
          </div>
        </header>

        {/* ── PAGE TITLE SECTION ── */}
        <div className="pp-title-section">
          <h1>Payment</h1>
          <p>Choose a payment method and complete your purchase</p>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <main className="pp-main-grid">

          {/* ── LEFT COLUMN ── */}
          <div className="pp-left-col">
            <div className="pp-card-label">SELECT PAYMENT METHOD</div>
            
            {/* Side-by-side Layout: Individual Tab Cards + Form Card */}
            <div className="pp-payment-methods-grid">
              
              {/* Vertical Tabs Stack */}
              <div className="pp-tabs-stack">
                {paymentMethods.map(m => {
                  const isActive = activeTab === m.id;
                  return (
                    <button
                      key={m.id}
                      className={`pp-tab-card ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveTab(m.id)}
                      type="button"
                    >
                      <div className="pp-tab-card-left">
                        <div className="pp-tab-card-icon">{m.icon}</div>
                        <div className="pp-tab-card-info">
                          <span className="pp-tab-card-title">{m.label}</span>
                          <span className="pp-tab-card-desc">{m.sub}</span>
                        </div>
                      </div>
                      <div className={`pp-tab-card-indicator ${isActive ? 'active' : ''}`}>
                        {isActive && <IconCheck />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Form Details Card */}
              <div className="pp-form-card">
                <AnimatePresence mode="wait">
                  
                  {/* CREDIT / DEBIT CARD FORM */}
                  {activeTab === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="pp-form-title">Enter Card Details</div>
                      
                      {/* Mobile Number */}
                      <div className="pp-field">
                        <label>Mobile Number (for ticket)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="pp-input"
                        />
                      </div>

                      {/* Card Number */}
                      <div className="pp-field">
                        <label>Card Number</label>
                        <div className="pp-input-wrap">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            className="pp-input"
                            style={{ paddingRight: 110 }}
                          />
                          <div className="pp-input-logos">
                            <SvgVisa style={{ opacity: (!cardBrand || cardBrand === 'visa') ? 1 : 0.2 }} />
                            <SvgMastercard style={{ opacity: (!cardBrand || cardBrand === 'mastercard') ? 1 : 0.2 }} />
                            <SvgRuPay style={{ opacity: (!cardBrand || cardBrand === 'rupay') ? 1 : 0.2 }} />
                          </div>
                        </div>
                      </div>

                      {/* Name and Expiry */}
                      <div className="pp-grid-2">
                        <div className="pp-field">
                          <label>Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            placeholder="Enter cardholder name"
                            className="pp-input"
                          />
                        </div>
                        <div className="pp-field">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM / YY"
                            className="pp-input"
                            maxLength={7}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                      </div>

                      {/* CVV */}
                      <div className="pp-grid-2">
                        <div className="pp-field">
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            CVV
                            <span title="3-digit CVV code on the back of your card" style={{ color: '#94A3B8', cursor: 'help', display: 'flex' }}><IconInfo /></span>
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            placeholder="123"
                            className="pp-input"
                            maxLength={4}
                            style={{ textAlign: 'center', letterSpacing: '2px' }}
                          />
                        </div>
                        <div className="pp-field">
                          <label style={{ visibility: 'hidden' }}>_</label>
                          <div className="pp-card-back-helper">
                            <div className="pp-card-back-strip" />
                            <div className="pp-card-back-signature" />
                            <div className="pp-cvv-preview">
                              {cardCvv ? cardCvv.replace(/./g, '•') : '123'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Save Card */}
                      <div style={{ marginTop: 8 }}>
                        <label className="pp-checkbox-label">
                          <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                          <span>Save card for future payments</span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* UPI FORM */}
                  {activeTab === 'upi' && (
                    <motion.div
                      key="upi"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="pp-form-title">Pay using UPI</div>
                      
                      <div className="pp-field">
                        <label>Mobile Number (for ticket)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="pp-input"
                        />
                      </div>

                      <div className="pp-field">
                        <label>Enter UPI ID / VPA</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="username@bank"
                          className="pp-input"
                        />
                      </div>

                      <div className="pp-field">
                        <label>Popular UPI Apps</label>
                        <div className="pp-upi-grid">
                          {upiApps.map(app => (
                            <button
                              key={app.id}
                              type="button"
                              className={`pp-upi-btn ${selectedUpiApp === app.id ? 'selected' : ''}`}
                              onClick={() => setSelectedUpiApp(app.id)}
                            >
                              <div style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: app.color + '15', color: app.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: 10,
                              }}>
                                {app.initials}
                              </div>
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pp-info-alert">
                        A payment request will be sent to your UPI app. Open the app and approve the request to finalize booking.
                      </div>
                    </motion.div>
                  )}

                  {/* NET BANKING FORM */}
                  {activeTab === 'netbanking' && (
                    <motion.div
                      key="netbanking"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="pp-form-title">Pay via Net Banking</div>

                      <div className="pp-field">
                        <label>Mobile Number (for ticket)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="pp-input"
                        />
                      </div>

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
                        <input
                          type="text"
                          value={customerId}
                          onChange={e => setCustomerId(e.target.value)}
                          placeholder="Enter your customer ID"
                          className="pp-input"
                        />
                      </div>

                      <div className="pp-field">
                        <label>Password</label>
                        <input
                          type="password"
                          value={netbankingPassword}
                          onChange={e => setNetbankingPassword(e.target.value)}
                          placeholder="Enter net banking password"
                          className="pp-input"
                        />
                      </div>

                      <div className="pp-info-alert">
                        After clicking Pay, you will be redirected to your bank's secure page to log in and approve.
                      </div>
                    </motion.div>
                  )}

                  {/* WALLETS FORM */}
                  {activeTab === 'wallet' && (
                    <motion.div
                      key="wallet"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="pp-form-title">Select Wallet</div>

                      <div className="pp-field">
                        <label>Mobile Number (for ticket)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter 10-digit mobile number"
                          className="pp-input"
                        />
                      </div>

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
                              background: w.color + '15', color: w.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: 10, flexShrink: 0,
                            }}>
                              {w.name.slice(0, 2).toUpperCase()}
                            </div>
                            {w.name}
                          </button>
                        ))}
                      </div>

                      <div className="pp-info-alert" style={{ marginTop: 16 }}>
                        Ensure you have sufficient balance in your wallet. You will be prompted to log in to verify.
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>

            {/* Pay Button Section (Full-width across left column) */}
            <div className="pp-pay-section">
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
                    Pay ₹{displayAmount.toLocaleString('en-IN')}
                  </>
                )}
              </button>
              
              <div className="pp-agree-text">
                <IconShield />
                <span>By continuing, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a></span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY ── */}
          <div className="pp-right-col">
            <div className="pp-card-label">ORDER SUMMARY</div>
            <div className="pp-summary-card">
            
            <div className="pp-turf-item">
              <img
                src={turfData?.images?.[0] || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'}
                alt={turfData?.name || 'Turf'}
                className="pp-turf-img"
              />
              <div className="pp-turf-info">
                <span className="pp-turf-name">{turfData?.name || 'EROTURF - Main Ground'}</span>
                <span className="pp-turf-sub">{bookingDate} • {allSlotTimes.length} slots</span>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#0F172A', fontSize: 14 }}>
                ₹{allBookings.reduce((s, b) => s + (b.pricing?.slotPrice || b.pricing?.total || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="pp-price-details">
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 4 }}>Price Details</div>
              
              <div className="pp-price-row">
                <span>Price ({allSlotTimes.length} slots)</span>
                <span>₹{allBookings.reduce((s, b) => s + (b.pricing?.slotPrice || b.pricing?.total || 0), 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="pp-price-row discount">
                <span>Discount</span>
                <span>- ₹0</span>
              </div>

              <div className="pp-price-row delivery">
                <span>Delivery Charges</span>
                <span>FREE</span>
              </div>

              <div className="pp-section-divider" />

              <div className="pp-price-total-row">
                <span className="pp-total-label">Total Amount</span>
                <div className="pp-total-wrap">
                  <div className="pp-total-amount">₹{displayAmount.toLocaleString('en-IN')}</div>
                  <div className="pp-total-subtext">(Inclusive of all taxes)</div>
                </div>
              </div>
            </div>

            <div className="pp-section-divider" />

            {/* Horizontal Trust badges under order summary card */}
            <div className="pp-trust-badges">
              <div className="pp-trust-badge">
                <div className="pp-trust-badge-icon"><IconShield /></div>
                <span className="pp-trust-badge-text">Secure<br />Payment</span>
              </div>
              <div className="pp-trust-badge">
                <div className="pp-trust-badge-icon"><IconClock /></div>
                <span className="pp-trust-badge-text">Easy<br />Cancellation</span>
              </div>
              <div className="pp-trust-badge">
                <div className="pp-trust-badge-icon"><IconStar /></div>
                <span className="pp-trust-badge-text">100%<br />Verified Turf</span>
              </div>
            </div>

          </div>
          </div>

        </main>

        {/* ── FOOTER: ACCEPTED BRANDS STRIP ── */}
        <footer className="pp-footer">
          <span className="pp-footer-title">We Accept</span>
          <div className="pp-brand-list">
            <span className="pp-brand-logo visa">VISA</span>
            <span className="pp-brand-logo mastercard">mastercard</span>
            <span className="pp-brand-logo rupay">RuPay</span>
            <span className="pp-brand-logo upi">UPI</span>
            <span className="pp-brand-logo paytm">paytm</span>
            <span className="pp-brand-logo gpay">G Pay</span>
            <span className="pp-brand-logo phonepe">PhonePe</span>
            <span className="pp-brand-logo bhim">BHIM</span>
            <span className="pp-brand-logo more">& more</span>
          </div>
        </footer>

      </div>
    </>
  );
}
