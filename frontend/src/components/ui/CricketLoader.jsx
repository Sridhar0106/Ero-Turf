import { motion } from 'framer-motion';

export default function CricketLoader({ message = "Loading..." }) {
  const duration = 1.6; // Speed of the animation loop

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-transparent">
      {/* Animation Container */}
      <div className="relative w-64 h-40 flex items-center justify-center overflow-hidden">
        
        {/* 1. BAT SHADOW ICON */}
        <motion.div
          style={{ transformOrigin: '12px 6px' }}
          animate={{
            rotate: [-65, -65, 25, 40, -65, -65]
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.48, 0.7, 1]
          }}
          className="absolute left-[80px] top-[15px] z-25 text-slate-800"
        >
          <svg width="24" height="80" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M10 0 C10 0 10 0 10 0 L14 0 C14 0 14 0 14 0 L14 28 L17 28 C18 28 19 29 19 30 L18 74 C18 77 15 80 12 80 C9 80 6 77 6 74 L5 30 C5 29 6 28 7 28 L10 28 Z" 
              fill="currentColor" 
            />
          </svg>
        </motion.div>

        {/* 2. BALL SHADOW ICON */}
        <motion.div
          animate={{
            x: [140, 140, 0, 140, 140, 140],
            y: [-50, -50, 0, -80, -80, -50],
            opacity: [0, 1, 1, 0, 0, 0]
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.55, 0.7, 1]
          }}
          className="absolute left-[117px] top-[95px] z-30 text-slate-800"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="8" fill="currentColor" />
          </svg>
        </motion.div>

        {/* 3. COLLISION RIPPLE / IMPACT */}
        <motion.div
          animate={{
            scale: [0, 0, 1.6, 0, 0],
            opacity: [0, 0, 0.4, 0, 0]
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "easeOut",
            times: [0, 0.39, 0.44, 0.6, 1]
          }}
          className="absolute left-[121px] top-[99px] w-10 h-10 rounded-full border border-slate-650 z-10 pointer-events-none"
        />

        {/* Ground crease shadow reference */}
        <div className="absolute bottom-6 inset-x-8 h-[2px] bg-slate-100" />
      </div>

      {/* Message Text */}
      {message && (
        <div className="text-center mt-4">
          <p className="text-[16px] font-semibold text-slate-700 tracking-wide uppercase" style={{ fontFamily: 'Figtree, sans-serif' }}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
