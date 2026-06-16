const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Turf = require('../models/Turf');
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');
const QRCode = require('qrcode');

// POST /api/bookings — create booking
router.post('/', verifyFirebaseToken, async (req, res) => {
  const { turfId, date, slot, slots, session, duration, team, pricing } = req.body;

  const slotsToBook = slots && slots.length > 0 ? slots : [slot];

  // Check slot availability
  const existingSlots = await TimeSlot.find({ turf: turfId, date, slot: { $in: slotsToBook } });
  const unavailableSlots = existingSlots.filter(s => s.status !== 'available');
  if (unavailableSlots.length > 0) {
    return res.status(400).json({ success: false, message: 'Slot is not available' });
  }

  // Create booking
  const booking = await Booking.create({
    user: req.user.id,
    turf: turfId,
    date,
    slot: slotsToBook.join(', '),
    slots: slotsToBook,
    session,
    duration: duration || slotsToBook.length,
    team,
    pricing,
    status: 'pending',
  });

  // Generate QR code
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    turf: turfId,
    date,
    slot: booking.slot,
    team: team.teamName,
  });
  const qrCode = await QRCode.toDataURL(qrData);
  booking.qrCode = qrCode;
  await booking.save();

  // Mark slots as booked (will be confirmed after payment)
  for (const slotName of slotsToBook) {
    const slotSession = getSession(slotName) || session;
    await TimeSlot.findOneAndUpdate(
      { turf: turfId, date, slot: slotName },
      { turf: turfId, date, slot: slotName, session: slotSession, status: 'booked', booking: booking._id },
      { upsert: true, new: true }
    );
  }

  // Increment user booking count
  await User.findByIdAndUpdate(req.user.id, { $inc: { bookingsCount: 1 } });
  await Turf.findByIdAndUpdate(turfId, { $inc: { totalBookings: 1 } });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('turf', 'name location pricing images')
    .populate('user', 'name email phone');

  res.status(201).json({ success: true, booking: populatedBooking });
});
// GET /api/bookings/my — user's bookings
router.get('/my', verifyFirebaseToken, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('turf', 'name location images')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// GET /api/bookings/:id — single booking
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  const isMultiple = req.params.id.includes(',');
  if (isMultiple) {
    const ids = req.params.id.split(',').map(s => s.trim());
    const bookings = await Booking.find({
      $or: [{ _id: { $in: ids } }, { bookingId: { $in: ids } }],
    })
      .populate('turf', 'name location pricing images features')
      .populate('user', 'name email phone avatar');

    // Check access for all
    const hasAccess = bookings.every(b => req.user.role === 'admin' || b.user._id.toString() === req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    return res.json({ success: true, bookings });
  }

  const booking = await Booking.findOne({
    $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
  })
    .populate('turf', 'name location pricing images features')
    .populate('user', 'name email phone avatar');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  // Users can only see their own bookings (admins can see all)
  if (
    req.user.role !== 'admin' &&
    booking.user._id.toString() !== req.user.id
  ) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', verifyFirebaseToken, async (req, res) => {
  const booking = await Booking.findOne({ bookingId: req.params.id });
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  booking.status = 'cancelled';
  await booking.save();

  // Free up the slots
  const slotsToFree = booking.slots && booking.slots.length > 0 ? booking.slots : [booking.slot];
  await TimeSlot.updateMany(
    { turf: booking.turf, date: booking.date, slot: { $in: slotsToFree } },
    { status: 'available', booking: null }
  );

  res.json({ success: true, message: 'Booking cancelled' });
});

function getSession(slot) {
  const hour = parseInt(slot.split(':')[0]);
  const isPM = slot.includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
  if (h24 >= 6 && h24 < 12) return 'morning';
  if (h24 >= 12 && h24 < 18) return 'afternoon';
  return 'evening';
}

module.exports = router;
