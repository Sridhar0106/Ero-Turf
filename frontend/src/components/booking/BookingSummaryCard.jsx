import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiMapPin } from 'react-icons/fi';
import { GiCricketBat } from 'react-icons/gi';
import { QRCodeCanvas } from 'qrcode.react';

export default function BookingSummaryCard({ booking, turf, showQR = false }) {
  const {
    bookingId,
    date,
    slot,
    session,
    duration = 1,
    team,
    pricing,
    status,
  } = booking;

  const sessionColors = {
    morning: '#d97706',
    afternoon: '#2563eb',
    evening: '#7c3aed',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
    >
      {/* Header strip */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b border-[#E2E8F0]"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(4,120,87,0.03))' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981, #065F46)' }}
          >
            <GiCricketBat className="text-white text-lg" />
          </div>
          <div>
            <p className="text-xs text-[#475569]">Booking ID</p>
            <p
              className="font-black text-[#047857] tracking-widest text-sm"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {bookingId}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="p-6 space-y-5">
        {/* Turf info */}
        <div>
          <p className="text-xs text-[#475569] mb-1">Venue</p>
          <div className="flex items-center gap-2">
            <FiMapPin className="text-[#10B981]" />
            <div>
              <p className="font-bold text-[#0F172A]">{turf?.name || 'EROTURF'}</p>
              <p className="text-sm text-[#475569]">
                {turf?.location?.address || ''}, {turf?.location?.city || ''}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#E2E8F0]" />

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(16,185,129,0.08)]"
            >
              <FiCalendar className="text-[#10B981]" style={{ fontSize: '0.9rem' }} />
            </div>
            <div>
              <p className="text-xs text-[#475569]">Date</p>
              <p className="font-semibold text-sm text-[#0F172A]">{date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${sessionColors[session] || '#10B981'}15` }}
            >
              <FiClock style={{ color: sessionColors[session] || '#10B981', fontSize: '0.9rem' }} />
            </div>
            <div>
              <p className="text-xs text-[#475569]">Time</p>
              <p className="font-semibold text-sm text-[#0F172A]">
                {slot} · {duration}hr
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(124,58,237,0.08)]"
          >
            <FiUsers className="text-[#7c3aed]" style={{ fontSize: '0.9rem' }} />
          </div>
          <div>
            <p className="text-xs text-[#475569]">Team</p>
            <p className="font-semibold text-sm text-[#0F172A]">
              {team?.teamName} · {team?.players} players
            </p>
            <p className="text-xs text-[#475569]">Captain: {team?.captainName}</p>
          </div>
        </div>

        <div className="h-px bg-[#E2E8F0]" />

        {/* Pricing */}
        {pricing && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Court / Slot Price</span>
              <span className="font-bold text-slate-800">₹{pricing.slotPrice}</span>
            </div>
            
            <div className="h-px bg-slate-200" />
            
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-sm text-[#0F172A]">Total Payable</span>
              <span
                className="text-xl font-black text-[#047857]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                ₹{pricing.total}
              </span>
            </div>
          </div>
        )}

        {/* QR Code */}
        {showQR && bookingId && (
          <div className="flex flex-col items-center pt-2">
            <div
              className="p-4 rounded-2xl border border-[#E2E8F0] shadow-sm bg-white"
            >
              <QRCodeCanvas
                value={JSON.stringify({ bookingId, date, slot, team: team?.teamName })}
                size={140}
                fgColor="#0F172A"
                bgColor="#ffffff"
                level="H"
              />
            </div>
            <p className="text-xs mt-3 text-center text-[#475569]">
              Show this QR at the venue
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PricingRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${muted ? 'text-[#475569]' : 'text-[#0F172A]'}`}>{label}</span>
      <span className={`text-sm font-semibold ${muted ? 'text-[#475569]' : 'text-[#0F172A]'}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    confirmed: { label: 'Confirmed', class: 'badge-green' },
    pending: { label: 'Pending', class: 'badge-yellow' },
    cancelled: { label: 'Cancelled', class: 'badge-red' },
    completed: { label: 'Completed', class: 'badge-blue' },
  };
  const c = config[status] || config.pending;
  return <span className={`badge ${c.class}`}>{c.label}</span>;
}
