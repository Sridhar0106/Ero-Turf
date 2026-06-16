const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TimeSlot = require('../models/TimeSlot');
const Turf = require('../models/Turf');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(verifyFirebaseToken, requireAdmin);

// GET /api/admin/stats — dashboard overview
router.get('/stats', async (req, res) => {
  const [totalUsers, totalBookings, totalTurfs, payments] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Booking.countDocuments(),
    Turf.countDocuments({ isActive: true }),
    Payment.find({ status: 'completed' }),
  ]);

  const totalRevenue = payments.reduce((acc, p) => acc + p.total / 100, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = await Booking.countDocuments({ date: today });
  const todaySlots = await TimeSlot.countDocuments({ date: today });
  const bookedToday = await TimeSlot.countDocuments({ date: today, status: 'booked' });

  // Revenue last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayPayments = await Payment.find({
      status: 'completed',
      createdAt: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z'),
      },
    });
    const dayRevenue = dayPayments.reduce((acc, p) => acc + p.total / 100, 0);
    last7Days.push({ date: dateStr, revenue: dayRevenue, bookings: dayPayments.length });
  }

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalBookings,
      totalTurfs,
      totalRevenue,
      todayBookings,
      occupancyRate: todaySlots > 0 ? Math.round((bookedToday / todaySlots) * 100) : 0,
      revenueChart: last7Days,
    },
  });
});

// GET /api/admin/bookings — all bookings
router.get('/bookings', async (req, res) => {
  const { page = 1, limit = 20, status, date } = req.query;
  const query = {};
  if (status) query.status = status;
  if (date) query.date = date;

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('turf', 'name location')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Booking.countDocuments(query);
  res.json({ success: true, bookings, total, page: parseInt(page) });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json({ success: true, user });
});

// POST /api/admin/slots/block — block time slots
router.post('/slots/block', async (req, res) => {
  const { turfId, date, slots, reason } = req.body;

  const operations = slots.map((slot) => ({
    updateOne: {
      filter: { turf: turfId, date, slot },
      update: {
        $set: {
          turf: turfId,
          date,
          slot,
          session: getSession(slot),
          status: 'blocked',
          blockedBy: req.user.id,
          blockedReason: reason || 'Admin blocked',
          booking: null,
        },
      },
      upsert: true,
    },
  }));

  await TimeSlot.bulkWrite(operations);
  res.json({ success: true, message: `${slots.length} slots blocked` });
});

// POST /api/admin/slots/unblock
router.post('/slots/unblock', async (req, res) => {
  const { turfId, date, slots } = req.body;
  await TimeSlot.updateMany(
    { turf: turfId, date, slot: { $in: slots }, status: 'blocked' },
    { status: 'available', blockedBy: null, blockedReason: null }
  );
  res.json({ success: true, message: 'Slots unblocked' });
});

// Helper
function getSession(slot) {
  const hour = parseInt(slot.split(':')[0]);
  const isPM = slot.includes('PM');
  const h24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
  if (h24 >= 6 && h24 < 12) return 'morning';
  if (h24 >= 12 && h24 < 18) return 'afternoon';
  return 'evening';
}

module.exports = router;
