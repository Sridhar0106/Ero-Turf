const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyFirebaseToken } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-__v');
  res.json({ success: true, user });
});

// PUT /api/users/profile
router.put('/profile', verifyFirebaseToken, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
});

module.exports = router;
