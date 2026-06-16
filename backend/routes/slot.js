const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking');

// Helper to classify slots into sessions
function getSession(slot) {
  const hour = parseInt(slot.split(':')[0]);
  const isPM = slot.includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
  if (h24 >= 6 && h24 < 12) return 'morning';
  if (h24 >= 12 && h24 < 18) return 'afternoon';
  return 'evening';
}

// Generate all slots for a 24-hour day
const generateDaySlots = () => {
  const allSlots = [];
  
  // 12:00 AM - 05:00 AM (Twilight)
  for (let h = 0; h < 6; h++) {
    const hour = h % 12 || 12;
    const time = `${String(hour).padStart(2, '0')}:00 AM`;
    allSlots.push({ time, session: getSession(time) });
  }
  // 06:00 AM - 11:00 AM (Morning)
  for (let h = 6; h < 12; h++) {
    const hour = h % 12 || 12;
    const time = `${String(hour).padStart(2, '0')}:00 AM`;
    allSlots.push({ time, session: getSession(time) });
  }
  // 12:00 PM - 05:00 PM (Noon)
  for (let h = 12; h < 18; h++) {
    const hour = h % 12 || 12;
    const time = `${String(hour).padStart(2, '0')}:00 PM`;
    allSlots.push({ time, session: getSession(time) });
  }
  // 06:00 PM - 11:00 PM (Evening)
  for (let h = 18; h < 24; h++) {
    const hour = h % 12 || 12;
    const time = `${String(hour).padStart(2, '0')}:00 PM`;
    allSlots.push({ time, session: getSession(time) });
  }
  
  return allSlots;
};


// GET /api/slots/:turfId/:date  — get slot availability
router.get('/:turfId/:date', async (req, res) => {
  const { turfId, date } = req.params;

  const turf = await Turf.findById(turfId);
  if (!turf) return res.status(404).json({ success: false, message: 'Turf not found' });

  // Auto-expire pending bookings older than 10 minutes (600 seconds)
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const expiredBookings = await Booking.find({
      turf: turfId,
      date,
      status: 'pending',
      createdAt: { $lt: tenMinutesAgo }
    });

    if (expiredBookings.length > 0) {
      const expiredIds = expiredBookings.map(b => b._id);
      await Booking.updateMany(
        { _id: { $in: expiredIds } },
        { status: 'cancelled' }
      );

      for (const booking of expiredBookings) {
        const slotsToFree = booking.slots && booking.slots.length > 0 ? booking.slots : [booking.slot];
        await TimeSlot.updateMany(
          { turf: turfId, date, slot: { $in: slotsToFree } },
          { status: 'available', booking: null }
        );
      }
    }
  } catch (err) {
    console.error('Error auto-expiring pending bookings:', err);
  }

  // Get existing slot records
  const existingSlots = await TimeSlot.find({ turf: turfId, date });
  const slotMap = {};
  existingSlots.forEach((s) => { slotMap[s.slot] = s; });

  // Generate full day slots
  const allSlots = generateDaySlots();
  const result = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  allSlots.forEach(({ time, session }) => {
    const existing = slotMap[time];
    const priceKey = session;
    result[session].push({
      time,
      session,
      status: existing ? existing.status : 'available',
      price: turf.pricing[priceKey],
    });
  });

  res.json({ success: true, date, turfId, slots: result });
});

module.exports = router;
