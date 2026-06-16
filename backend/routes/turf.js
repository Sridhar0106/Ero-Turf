const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth');

// GET /api/turfs — list all active turfs
router.get('/', async (req, res) => {
  const turfs = await Turf.find({ isActive: true }).select('-__v');
  res.json({ success: true, count: turfs.length, turfs });
});

// GET /api/turfs/:id — single turf detail
router.get('/:id', async (req, res) => {
  const turf = await Turf.findById(req.params.id);
  if (!turf) return res.status(404).json({ success: false, message: 'Turf not found' });
  res.json({ success: true, turf });
});

// POST /api/turfs — create turf (admin)
router.post('/', verifyFirebaseToken, requireAdmin, async (req, res) => {
  const turf = await Turf.create(req.body);
  res.status(201).json({ success: true, turf });
});

// PUT /api/turfs/:id — update turf (admin)
router.put('/:id', verifyFirebaseToken, requireAdmin, async (req, res) => {
  const turf = await Turf.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!turf) return res.status(404).json({ success: false, message: 'Turf not found' });
  res.json({ success: true, turf });
});

// DELETE /api/turfs/:id — soft delete (admin)
router.delete('/:id', verifyFirebaseToken, requireAdmin, async (req, res) => {
  await Turf.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Turf deactivated' });
});

// Seed demo turf
router.post('/seed/demo', async (req, res) => {
  const existing = await Turf.findOne({ name: 'EROTURF - Main Ground' });
  if (existing) return res.json({ success: true, turf: existing, message: 'Already seeded' });

  const turf = await Turf.create({
    name: 'EROTURF - Main Ground',
    description:
      'Premium cricket turf with world-class facilities, floodlights, and professional-grade pitch.',
    location: {
      address: '123 Sports Complex, ECR Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600119',
    },
    images: [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
      'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800',
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
      'Drinking Water',
    ],
    pricing: { morning: 800, afternoon: 700, evening: 1000 },
    rating: 4.8,
  });

  res.status(201).json({ success: true, turf });
});

module.exports = router;
