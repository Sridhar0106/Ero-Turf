import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getTurfs, getSlots, createBooking } from '../services/api';
import DateSelector from '../components/booking/DateSelector';
import SlotGrid from '../components/booking/SlotGrid';
import { format } from 'date-fns';
import {
  FiUser, FiUsers, FiPhone, FiFlag, FiStar, FiMapPin,
  FiCheck, FiArrowRight
} from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import toast from 'react-hot-toast';
import CricketLoader from '../components/ui/CricketLoader';

const GST_RATE = 0;

const turfFeatureIcons = {
  'Floodlights': '💡',
  'Changing Rooms': '🚿',
  'Parking': '🅿️',
  'Canteen': '🍽️',
  'Equipment Rental': '🏏',
  'Scoreboard': '📊',
  'CCTV': '📹',
  'Drinking Water': '💧',
};

const MOCK_TURF = {
  _id: '000000000000000000000001',
  name: 'EROTURF - Main Ground',
  description: 'Premium cricket turf with world-class facilities, floodlights, and professional-grade pitch.',
  location: {
    address: '123 Sports Complex, ECR Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600119',
  },
  images: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
    'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800'
  ],
  capacity: 22,
  features: [
    'Floodlights',
    'Changing Rooms',
    'Parking',
    'Canteen',
    'Equipment Rental',
    'Scoreboard',
    'CCTV',
    'Drinking Water'
  ],
  pricing: { morning: 800, afternoon: 700, evening: 1000 },
  rating: 4.8,
};

export default function BookingPage() {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [selectedSport, setSelectedSport] = useState('Cricket'); // Football | Cricket
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSegment, setSelectedSegment] = useState('Evening'); // Twilight | Morning | Noon | Evening
  const [slots, setSlots] = useState({ morning: [], afternoon: [], evening: [] });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingTurfs, setLoadingTurfs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Team information state is no longer needed in the frontend UI.

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date();
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Load turfs
  useEffect(() => {
    loadTurfs();
  }, []);

  const loadTurfs = async () => {
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const fetchPromise = (async () => {
        const { data } = await getTurfs();
        if (data.turfs?.length > 0) {
          setTurfs(data.turfs);
          setSelectedTurf(data.turfs[0]);
        } else {
          // Seed demo and try again
          try {
            const { default: api } = await import('../services/api');
            await api.post('/turfs/seed/demo');
            const { data: data2 } = await getTurfs();
            if (data2.turfs?.length > 0) {
              setTurfs(data2.turfs);
              setSelectedTurf(data2.turfs[0]);
            } else {
              setTurfs([MOCK_TURF]);
              setSelectedTurf(MOCK_TURF);
            }
          } catch {
            setTurfs([MOCK_TURF]);
            setSelectedTurf(MOCK_TURF);
          }
        }
      })();

      await Promise.all([fetchPromise, minDelayPromise]);
    } catch {
      // Fallback to gorgeous mock turf so user is never blocked
      setTurfs([MOCK_TURF]);
      setSelectedTurf(MOCK_TURF);
      await minDelayPromise;
    } finally {
      setLoadingTurfs(false);
    }
  };

  // Load slots when turf or date changes
  useEffect(() => {
    if (selectedTurf && selectedDate) loadSlots();
  }, [selectedTurf, selectedDate]);

  // Reset selected slots if turf or sport changes
  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedSport, selectedTurf]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const { data } = await getSlots(selectedTurf._id, selectedDate);
      if (data.slots && Object.keys(data.slots).length > 0) {
        setSlots(data.slots);
      } else {
        setSlots(generateMockSlots(selectedTurf?.pricing));
      }
    } catch {
      // Use mock slots if backend not available
      setSlots(generateMockSlots(selectedTurf?.pricing));
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateMockSlots = (pricing = {}) => {
    const makeSlots = (hours, session, price) =>
      hours.map((h, i) => ({
        time: h,
        session,
        price,
        status: i % 4 === 2 ? 'booked' : i % 7 === 6 ? 'limited' : 'available',
      }));
    return {
      morning: [
        ...makeSlots(['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'], 'evening', pricing.evening || 1000),
        ...makeSlots(['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'], 'morning', pricing.morning || 800)
      ],
      afternoon: makeSlots(
        ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
        'afternoon', pricing.afternoon || 700
      ),
      evening: makeSlots(
        ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'],
        'evening', pricing.evening || 1000
      ),
    };
  };

  const handleBook = async () => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    if (selectedSlots.length === 0) { toast.error('Please select at least one time slot'); return; }

    // Group selected slots by date
    const groupedSlots = selectedSlots.reduce((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {});

    // Auto-populate team info to satisfy backend database requirements
    const automaticTeamInfo = {
      teamName: `${user?.name || 'User'}'s Team`,
      captainName: user?.name || 'User',
      mobile: user?.phone || '0000000000',
      players: 11,
    };

    setSubmitting(true);
    try {
      const bookingPromises = Object.entries(groupedSlots).map(async ([dateStr, dateSlots]) => {
        const slotPrice = dateSlots.reduce((sum, s) => sum + s.price, 0);
        const gst = Math.round(slotPrice * GST_RATE);
        const total = slotPrice + gst;

        const { data } = await createBooking({
          turfId: selectedTurf._id,
          date: dateStr,
          slots: dateSlots.map(s => s.time),
          slot: dateSlots.map(s => s.time).join(', '),
          session: dateSlots[0].session,
          duration: dateSlots.length,
          team: automaticTeamInfo,
          pricing: { slotPrice, gst, total },
        });
        return data.booking;
      });

      const bookings = await Promise.all(bookingPromises);

      const totalAmount = bookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
      const bookingIdsParam = bookings.map(b => b.bookingId).join(',');

      navigate('/payment', {
        state: { 
          bookings,
          booking: bookings[0], // fallback compatibility
          turf: selectedTurf,
          totalAmount,
          bookingIdsParam
        },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to filter slots by Twilight, Morning, Noon, Evening segments
  const getFilteredSlots = () => {
    const allSlots = [
      ...(slots.morning || []),
      ...(slots.afternoon || []),
      ...(slots.evening || [])
    ];
    
    const twilightTimes = ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'];
    const morningTimes = ['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
    const noonTimes = ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
    const eveningTimes = ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'];
    
    if (selectedSegment === 'Twilight') {
      return allSlots.filter(s => twilightTimes.includes(s.time));
    }
    if (selectedSegment === 'Morning') {
      return allSlots.filter(s => morningTimes.includes(s.time));
    }
    if (selectedSegment === 'Noon') {
      return allSlots.filter(s => noonTimes.includes(s.time));
    }
    if (selectedSegment === 'Evening') {
      return allSlots.filter(s => eveningTimes.includes(s.time));
    }
    return [];
  };

  const totalSlotPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const pricing = selectedSlots.length > 0
    ? {
        slotPrice: totalSlotPrice,
        gst: Math.round(totalSlotPrice * GST_RATE),
        total: totalSlotPrice + Math.round(totalSlotPrice * GST_RATE),
      }
    : null;

  return (
    <div 
      className="min-h-screen relative bg-slate-50" 
      style={{ 
        paddingTop: '95px',
        paddingBottom: '8rem'
      }}
    >
      <AnimatePresence mode="wait">
        {loadingTurfs ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex items-center justify-center min-h-[70vh]"
          >
            <CricketLoader message="Loading turf details..." />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative z-10 container mx-auto px-5 sm:px-8 md:px-10 lg:px-12 max-w-7xl pb-36"
          >
            {/* Page Header */}
            <div className="mb-10">
              <h1 className="section-heading text-[#0F172A]" style={{ fontFamily: 'var(--font-heading)' }}>Turf Booking</h1>
              <p className="text-[#475569] mt-2 font-medium">
                Configure your sports booking choices and check slot availability in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column — Main booking pipeline */}
              <div className="lg:col-span-2 flex flex-col gap-8">

                {/* Step 1: Select Sport */}
                <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 booking-section-card">
                  <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '28px' }} className="text-2xl font-bold text-[#0F172A]">
                    Select Sport
                  </h2>
                  <div className="flex gap-4 sm:gap-10 flex-wrap pb-1">
                    {[
                      { id: 'Football', name: 'Football', image: '/football-card.png' },
                      { id: 'Cricket', name: 'Cricket', image: '/cricket-card.png' },
                    ].map((sport) => {
                      const isActive = selectedSport === sport.id;
                      return (
                        <div
                          key={sport.id}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          onClick={() => setSelectedSport(sport.id)}
                        >
                          <div
                            className={`w-28 h-28 rounded-2xl p-2 transition-all duration-300 ${
                              isActive 
                                ? 'bg-white border-[3px] border-[#00C853] shadow-lg scale-105' 
                                : 'bg-slate-50/50 border border-slate-200/60 hover:scale-102 hover:border-slate-300'
                            }`}
                          >
                            <img src={sport.image} alt={sport.name} className="w-full h-full object-cover rounded-xl select-none" />
                          </div>
                          <span className={`text-base font-extrabold transition-colors ${isActive ? 'text-[#00C853]' : 'text-slate-500 group-hover:text-[#0F172A]'}`}>
                            {sport.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Choose Date */}
                <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden booking-date-card">
                  <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '28px' }} className="text-2xl font-bold text-[#0F172A] booking-date-card-title">
                    Choose Date
                  </h2>
                  <div>
                    <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                  </div>
                </div>

                {/* Step 3: Choose Segment */}
                <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 booking-section-card-tall">
                  <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '28px' }} className="text-2xl font-bold text-[#0F172A]">
                    Choose Segment
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pb-1">
                    {[
                      { id: 'Twilight', name: 'Twilight', image: '/segment-twilight.png' },
                      { id: 'Morning', name: 'Morning', image: '/segment-morning.png' },
                      { id: 'Noon', name: 'Noon', image: '/segment-noon.png' },
                      { id: 'Evening', name: 'Evening', image: '/segment-evening.png' },
                    ].map((seg) => {
                      const isActive = selectedSegment === seg.id;
                      return (
                        <div
                          key={seg.id}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                          onClick={() => setSelectedSegment(seg.id)}
                        >
                          <div
                            className={`w-full aspect-square rounded-2xl p-2 transition-all duration-300 ${
                              isActive 
                                ? 'bg-white border-[3px] border-[#00C853] shadow-lg scale-105' 
                                : 'bg-slate-50/50 border border-slate-200/60 hover:scale-102 hover:border-slate-300'
                            }`}
                          >
                            <img src={seg.image} alt={seg.name} className="w-full h-full object-cover rounded-xl select-none" />
                          </div>
                          <span className={`text-base font-extrabold transition-colors ${isActive ? 'text-[#00C853]' : 'text-slate-500 group-hover:text-[#0F172A]'}`}>
                            {seg.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Choose Time */}
                <div className="rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 booking-section-card-tall">
                  <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '28px' }} className="text-2xl font-bold text-[#0F172A]">
                    Choose Time
                  </h2>
                  <div>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 py-8 justify-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#00C853] rounded-full animate-spin" />
                        <span className="text-sm text-[#475569]">Loading time slots...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
                        {getFilteredSlots().map((slot) => {
                          const isSelected = selectedSlots.some(s => s.date === selectedDate && s.time === slot.time);
                          const isBooked = slot.status === 'booked';
                          const isLimited = slot.status === 'limited';
                          
                          const get24HourTime = (timeStr) => {
                            const [time, modifier] = timeStr.split(' ');
                            let [hours, minutes] = time.split(':');
                            if (hours === '12') {
                              hours = '00';
                            }
                            if (modifier === 'PM') {
                              hours = parseInt(hours, 10) + 12;
                            }
                            return `${hours}:${minutes}`;
                          };

                          const timeLabel = get24HourTime(slot.time);

                          return (
                            <div key={slot.time} className="flex flex-col items-center gap-2 text-center">
                              <span className="text-xs font-semibold text-[#475569] select-none">
                                {timeLabel}
                              </span>
                              <button
                                disabled={isBooked}
                                onClick={() => {
                                  setSelectedSlots((prev) => {
                                    const exists = prev.some((s) => s.date === selectedDate && s.time === slot.time);
                                    if (exists) {
                                      return prev.filter((s) => !(s.date === selectedDate && s.time === slot.time));
                                    } else {
                                      return [...prev, { ...slot, date: selectedDate }];
                                    }
                                  });
                                }}
                                className={`w-full py-3.5 rounded-xl font-extrabold transition-all border cursor-pointer focus:outline-none flex items-center justify-center text-sm ${
                                  isSelected
                                    ? 'bg-[#00C853] text-white border-[#00C853] scale-[1.03] shadow-md shadow-[#00C853]/25'
                                    : isBooked
                                    ? 'bg-slate-100 text-slate-400 border-slate-150 cursor-not-allowed shadow-none'
                                    : isLimited
                                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100/50'
                                    : 'bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-[#00C853]/10 hover:text-[#00C853] hover:border-[#00C853]/30'
                                }`}
                                style={{
                                  minHeight: '48px',
                                }}
                              >
                                {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                              </button>
                            </div>
                          );
                        })}
                        {getFilteredSlots().length === 0 && (
                          <p className="col-span-full text-center py-8 text-sm text-[#94A3B8] font-medium">
                            No slots available for this segment. Please select another segment.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column — Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky" style={{ top: '105px' }}>
                  
                  {/* Digital Ticket Container */}
                  <div className="relative bg-white border border-[#E2E8F0]/80 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                    


                    {/* Ticket Body */}
                    <div className="flex-1 flex flex-col space-y-4 ticket-body-padding">
                      <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }} className="text-2xl font-bold text-[#0F172A]">
                        Order Summary
                      </h2>
                      <div className="flex-1 flex flex-col">
                        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3">Schedule Details</p>
                        
                        {selectedSlots.length > 0 ? (
                          (() => {
                            const uniqueDates = Array.from(new Set(selectedSlots.map(s => s.date)));
                            if (uniqueDates.length <= 1) {
                              return (
                                <div className="flex-1 flex flex-col justify-center bg-emerald-50/30 border border-[#00C853]/20 rounded-2xl space-y-5 ticket-inner-padding">
                                  <div className="flex items-center gap-3.5 text-[#0F172A]" style={{ marginBottom: '20px' }}>
                                    <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853] shrink-0 shadow-sm border border-[#00C853]/10">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div className="leading-snug">
                                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Date Selected</p>
                                      <span className="text-sm font-extrabold text-slate-800">{format(parseLocalDate(uniqueDates[0] || selectedDate), 'EEEE, MMMM dd, yyyy')}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3.5 text-[#0F172A]">
                                    <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853] shrink-0 shadow-sm border border-[#00C853]/10 mt-0.5">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div className="leading-snug flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Time Slots</p>
                                      <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
                                        {selectedSlots.map((s) => (
                                          <span key={s.time} className="text-xs font-extrabold bg-[#00C853]/10 text-[#047857] px-2.5 py-1 rounded-lg border border-[#00C853]/15">
                                            {s.time}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Grouped multi-date layout
                            return (
                              <div className="flex-1 flex flex-col justify-start bg-emerald-50/30 border border-[#00C853]/20 rounded-2xl space-y-4 max-h-[180px] overflow-y-auto pr-1 ticket-inner-padding">
                                {Object.entries(
                                  selectedSlots.reduce((acc, s) => {
                                    if (!acc[s.date]) acc[s.date] = [];
                                    acc[s.date].push(s);
                                    return acc;
                                  }, {})
                                ).map(([dateStr, dateSlots]) => (
                                  <div key={dateStr} className="flex items-start gap-3 border-b border-[#00C853]/10 pb-3 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded-lg bg-[#00C853]/10 flex items-center justify-center text-[#00C853] shrink-0 border border-[#00C853]/10 mt-0.5">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                                        {format(parseLocalDate(dateStr), 'MMM dd, yyyy')}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {dateSlots.map((s) => (
                                          <span key={s.time} className="text-[11px] font-extrabold bg-[#00C853]/10 text-[#047857] px-2 py-0.5 rounded border border-[#00C853]/15">
                                            {s.time}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center bg-amber-50/30 border border-amber-500/15 rounded-2xl p-6 text-center space-y-3">
                            <motion.div
                              animate={{ y: [0, -6, 0] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              className="text-3xl mb-1"
                            >
                              ⏳
                            </motion.div>
                            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Time Slots Pending</h5>
                            <p className="text-[11px] text-[#8C620C]/80 leading-relaxed max-w-[200px]">
                              Choose available time slots on the left to lock your slots and activate the ticket.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Perforated Cut-Out Separator */}
                    <div className="relative w-full h-4 flex items-center justify-between">
                      {/* Left side cutout */}
                      <div className="absolute left-[-8px] w-4 h-4 bg-white border border-[#E2E8F0] rounded-full z-10" />
                      {/* Dashed line */}
                      <div className="w-full border-t border-dashed border-[#E2E8F0] mx-3" />
                      {/* Right side cutout */}
                      <div className="absolute right-[-8px] w-4 h-4 bg-white border border-[#E2E8F0] rounded-full z-10" />
                    </div>

                    {/* Ticket Pricing / Checkout Stub */}
                    <div className="bg-slate-50/50 border-t border-slate-100 space-y-5 ticket-footer-padding">
                      
                      {pricing ? (
                        <div className="bg-white border border-[#E2E8F0] rounded-2xl space-y-4 shadow-sm ticket-inner-padding">
                          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase" style={{ marginBottom: '16px' }}>Payment Breakdown</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-medium flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-lg bg-[#00C853]/10 flex items-center justify-center text-[#00C853] shrink-0 border border-[#00C853]/15 font-black text-sm">
                                ₹
                              </span>
                              Base Price ({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})
                            </span>
                            <span className="font-extrabold text-base text-slate-800">₹{pricing.slotPrice}</span>
                          </div>
                          
                          <div className="h-px bg-slate-100" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-700">Total Payable</span>
                            <span className="font-black text-3xl text-[#047857]" style={{ fontFamily: 'var(--font-brand)' }}>
                              ₹{pricing.total}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/50 border border-dashed border-[#E2E8F0] rounded-2xl py-5 px-4 text-center">
                          <span className="text-slate-400 text-sm font-semibold">Select slot(s) to calculate price</span>
                        </div>
                      )}

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: selectedSlots.length > 0 ? 1.02 : 1 }}
                        whileTap={{ scale: selectedSlots.length > 0 ? 0.98 : 1 }}
                        onClick={handleBook}
                        disabled={submitting}
                        style={{ marginTop: '24px' }}
                        className={`w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md border-none ${
                          selectedSlots.length > 0
                            ? 'bg-[#00C853] text-white hover:bg-[#00B24A] hover:shadow-lg hover:shadow-[#00C853]/30'
                            : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'
                        }`}
                        id="proceed-booking-btn"
                      >
                        {submitting ? (
                          <div className="w-6 h-6 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {selectedSlots.length > 0 ? 'Proceed to Secure Payment' : 'Activate Ticket (Choose Slots)'}
                            {selectedSlots.length > 0 && <FiArrowRight className="w-5 h-5" />}
                          </>
                        )}
                      </motion.button>

                      {/* Security details */}
                      <div className="flex flex-col items-center gap-1.5 text-xs text-slate-400 font-semibold mt-1">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                          Safe & Secure SSL Booking
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormField({ icon: Icon, label, placeholder, value, error, onChange, type = 'text', id }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-sm font-medium text-[#475569] flex items-center gap-1.5">
        <Icon className="text-[#00C853]" /> {label}
      </label>
      <input
        id={id}
        type={type}
        className={`input-field ${error ? 'border-red-500 bg-red-50/20' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[#475569]">{label}</span>
      <span
        className="font-semibold text-right max-w-[55%] truncate"
        style={{ color: highlight ? 'var(--color-primary-dark)' : '#0F172A' }}
      >
        {value}
      </span>
    </div>
  );
}
