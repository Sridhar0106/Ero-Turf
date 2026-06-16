import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';

export default function DateSelector({ selectedDate, onDateSelect }) {
  const scrollRef = useRef(null);
  const days = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    // Scroll selected into view inside the horizontal container only
    const selectedIndex = days.findIndex(
      (d) => format(d, 'yyyy-MM-dd') === selectedDate
    );
    if (scrollRef.current && selectedIndex >= 0) {
      const container = scrollRef.current;
      const card = container.children[selectedIndex];
      if (card) {
        const cardOffset = card.offsetLeft;
        const cardWidth = card.clientWidth;
        const containerWidth = container.clientWidth;
        const targetScrollLeft = cardOffset - (containerWidth / 2) + (cardWidth / 2);
        
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDate]);

  // Convert vertical mouse wheel to horizontal scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Only hijack if there's actual horizontal scroll room
      if (container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 1.5,
          behavior: 'smooth',
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-3"
        style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
      >
        {days.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          const dayNum = format(date, 'dd'); // Leading zero like "02"
          const monthStr = format(date, 'MMMM'); // Full month name like "June"
          const weekdayStr = format(date, 'EEEE'); // Full weekday name like "Tuesday"

          return (
            <motion.button
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.01 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(dateStr)}
              className="flex flex-col justify-center items-center font-semibold text-center select-none cursor-pointer shadow-sm transition-all focus:outline-none flex-shrink-0"
              style={{
                minWidth: '110px',
                height: '136px',
                borderRadius: '20px',
                backgroundColor: isSelected ? '#00C853' : '#F8FAFC',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1.5px solid #00C853' : '1.5px solid #E2E8F0',
                boxShadow: isSelected ? '0 8px 20px -6px rgba(0, 200, 83, 0.4)' : 'none',
              }}
              id={`date-${dateStr}`}
            >
              {/* Date Number */}
              <span className="text-3xl font-extrabold tracking-tight leading-none mb-1">
                {dayNum}
              </span>
              
              {/* Month */}
              <span className="text-sm font-bold opacity-90 tracking-wide mb-0.5">
                {monthStr}
              </span>
              
              {/* Weekday */}
              <span className="text-xs font-medium opacity-85">
                {weekdayStr}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
