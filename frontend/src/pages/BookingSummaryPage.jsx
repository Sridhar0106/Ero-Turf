import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BookingSummaryCard from '../components/booking/BookingSummaryCard';
import { FiArrowLeft, FiCreditCard, FiShield } from 'react-icons/fi';

export default function BookingSummaryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { booking, bookings, turf } = state || {};
  const allBookings = bookings || (booking ? [booking] : []);

  if (allBookings.length === 0 || !turf) {
    navigate('/book');
    return null;
  }

  const totalAmount = allBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
  const bookingIdsParam = allBookings.map(b => b.bookingId).join(',');

  const handlePayment = () => {
    navigate('/payment', {
      state: { bookings: allBookings, turf, totalAmount, bookingIdsParam },
    });
  };

  return (
    <div className="min-h-screen pb-16 bg-white" style={{ paddingTop: '130px' }}>
      <div className="container mx-auto px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm mb-6 hover:text-[#00C853] transition-colors"
            style={{ color: '#475569' }}
          >
            <FiArrowLeft /> Back to Booking
          </button>

          <div className="mb-6">
            <span className="badge badge-green mb-2">Step 2 of 3</span>
            <h1 className="section-heading text-[#0F172A]">Booking Summary</h1>
            <p className="text-[#475569] mt-2">
              Review your booking{allBookings.length > 1 ? 's' : ''} before proceeding to payment
            </p>
          </div>

          <div className="space-y-4">
            {allBookings.map((b) => (
              <BookingSummaryCard key={b.bookingId} booking={b} turf={turf} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 shadow-md border-none cursor-pointer"
              id="pay-now-btn"
            >
              <FiCreditCard /> Proceed to Payment
            </motion.button>

            {/* Payment methods */}
            <div className="glass rounded-xl p-4 flex items-center justify-center gap-6 border border-[#E2E8F0] bg-[#F8FAFC] shadow-sm">
              {['Visa', 'Mastercard', 'UPI', 'Google Pay'].map((method) => (
                <span key={method} className="text-xs font-semibold text-[#475569]">
                  {method}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-[#475569]">
              <FiShield className="text-[#00C853]" />
              Secured by Razorpay — 256-bit SSL encryption
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
