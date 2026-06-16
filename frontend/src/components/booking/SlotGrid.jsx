import { motion } from 'framer-motion';
import { FiSun, FiCloud, FiMoon } from 'react-icons/fi';

const sessionConfig = {
  morning: {
    label: 'Morning',
    time: '6:00 AM – 12:00 PM',
    icon: FiSun,
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.04)',
    border: '#fde68a',
  },
  afternoon: {
    label: 'Afternoon',
    time: '12:00 PM – 6:00 PM',
    icon: FiCloud,
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.04)',
    border: '#bfdbfe',
  },
  evening: {
    label: 'Evening',
    time: '6:00 PM – 12:00 AM',
    icon: FiMoon,
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.04)',
    border: '#ddd6fe',
  },
};

export default function SlotGrid({ session, slots = [], selectedSlot, onSlotSelect, loading }) {
  const config = sessionConfig[session];
  const Icon = config.icon;

  const availableCount = slots.filter((s) => s.status === 'available').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ border: `1px solid ${config.border}`, background: config.bg }}
    >
      {/* Session Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${config.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${config.color}15` }}
          >
            <Icon style={{ color: config.color, fontSize: '1.2rem' }} />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: 'var(--font-heading)' }}>
              {config.label}
            </h3>
            <p className="text-xs text-[#475569]">{config.time}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold" style={{ color: config.color }}>
            ₹{slots[0]?.price || '--'}
          </span>
          <p className="text-xs text-[#475569]">/ hour</p>
        </div>
      </div>

      {/* Slot grid */}
      <div className="p-4 bg-white">
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.time;
                const isDisabled = slot.status === 'booked' || slot.status === 'blocked';

                return (
                  <motion.button
                    key={slot.time}
                    whileHover={!isDisabled ? { y: -2 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    onClick={() => !isDisabled && onSlotSelect(slot)}
                    disabled={isDisabled}
                    className={`relative py-2.5 px-2 rounded-xl text-center text-sm font-semibold transition-all duration-200
                      ${isSelected ? 'slot-selected' : ''}
                      ${!isSelected && slot.status === 'available' ? 'slot-available' : ''}
                      ${!isSelected && slot.status === 'booked' ? 'slot-booked' : ''}
                      ${!isSelected && slot.status === 'limited' ? 'slot-limited' : ''}
                      ${!isSelected && slot.status === 'blocked' ? 'slot-blocked' : ''}
                    `}
                    id={`slot-${slot.time.replace(/[\s:]/g, '-')}`}
                  >
                    {slot.time}
                    {isSelected && (
                      <motion.div
                        layoutId="slot-indicator"
                        className="absolute inset-0 rounded-xl"
                        style={{ border: '2px solid var(--color-primary)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 flex-wrap border-t border-[#E2E8F0] pt-4">
              <LegendItem color="#00C853" bg="rgba(0, 200, 83, 0.08)" label="Available" />
              <LegendItem color="#ef4444" bg="rgba(239, 68, 68, 0.08)" label="Booked" />
              <LegendItem color="#F59E0B" bg="rgba(245, 158, 11, 0.08)" label="Limited" />
              <div className="ml-auto">
                <span className="text-xs text-[#475569] font-medium">
                  {availableCount}/{slots.length} available
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function LegendItem({ color, bg, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3.5 h-3.5 rounded border" style={{ background: bg, borderColor: color }} />
      <span className="text-xs text-[#475569] font-medium">{label}</span>
    </div>
  );
}
