const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper: decode a JWT payload without verifying signature (dev fallback only)
const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

// Check if Firebase Admin is properly initialized (not with placeholder creds)
const isFirebaseAdminConfigured = () => {
  return (
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_CLIENT_EMAIL !== 'your-firebase-client-email' &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_PRIVATE_KEY !== 'your-firebase-private-key'
  );
};

// POST /api/auth/verify  — verify Firebase token and upsert user
router.post('/verify', async (req, res) => {
  const { idToken, name, email, phone, avatar } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'ID token required' });
  }

  let firebaseUid, userEmail, userPhone;

  // Try Firebase Admin verification first
  if (isFirebaseAdminConfigured()) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      firebaseUid = decoded.uid;
      userEmail = decoded.email || email;
      userPhone = decoded.phone_number || phone;
    } catch (firebaseErr) {
      return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
    }
  } else if (process.env.NODE_ENV === 'development') {
    // Dev mode fallback: Firebase Admin not configured.
    // Decode token payload WITHOUT signature verification (trusted in local dev).
    if (idToken === 'dev_placeholder_token' || idToken === 'dev_token') {
      firebaseUid = 'dev_user_001';
      userEmail = email || 'dev@eroturf.com';
      userPhone = phone;
    } else {
      // Real Firebase ID token from frontend Firebase SDK — decode without verification
      const payload = decodeJwtPayload(idToken);
      if (payload && (payload.sub || payload.uid)) {
        firebaseUid = payload.sub || payload.uid;
        userEmail = payload.email || email;
        userPhone = payload.phone_number || phone;
      } else {
        return res.status(401).json({ success: false, message: 'Could not decode token in dev mode' });
      }
    }
  } else {
    return res.status(401).json({ success: false, message: 'Firebase Admin not configured' });
  }

  // Upsert user
  let user = await User.findOneAndUpdate(
    { firebaseUid },
    {
      $set: {
        firebaseUid,
        name: name || userEmail?.split('@')[0] || 'User',
        email: userEmail,
        phone: userPhone,
        avatar: avatar || '',
        lastLogin: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: false }
  );

  // Generate JWT for API auth
  const token = jwt.sign(
    { id: user._id, uid: user.firebaseUid, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

// GET /api/auth/me — get current user
router.get('/me', require('../middleware/auth').verifyFirebaseToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-__v');
  res.json({ success: true, user });
});

// Normalize phone number to E.164 (e.g. +919876543210)
const normalizePhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, ''); // Keep only digits
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (!phone.startsWith('+') && cleaned.startsWith('91') && cleaned.length > 10) {
    return `+${cleaned}`;
  }
  if (phone.startsWith('+')) {
    return phone;
  }
  return `+${cleaned}`;
};

// POST /api/auth/otp/send — Send Twilio Verify OTP
router.post('/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const normalizedPhone = normalizePhone(phone);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return res.status(500).json({ success: false, message: 'Twilio configuration is missing on server' });
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', normalizedPhone);
    params.append('Channel', 'sms');

    const twilioResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await twilioResponse.json();
    if (!twilioResponse.ok) {
      return res.status(400).json({ success: false, message: data.message || 'Failed to send OTP via Twilio' });
    }

    res.json({ success: true, message: 'OTP sent successfully', sid: data.sid });
  } catch (err) {
    console.error('Twilio Send OTP Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error sending OTP' });
  }
});

// POST /api/auth/otp/verify — Verify Twilio Verify OTP
router.post('/otp/verify', async (req, res) => {
  const { phone, code, name } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
  }

  const normalizedPhone = normalizePhone(phone);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return res.status(500).json({ success: false, message: 'Twilio configuration is missing on server' });
  }

  try {
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', normalizedPhone);
    params.append('Code', code);

    const twilioResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await twilioResponse.json();
    if (!twilioResponse.ok || data.status !== 'approved') {
      return res.status(400).json({ success: false, message: data.message || 'Invalid or expired OTP' });
    }

    // OTP is verified! Search/upsert user.
    let user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      const twilioUid = `twilio_${normalizedPhone.replace('+', '')}`;
      user = await User.create({
        firebaseUid: twilioUid,
        name: name || `User ${normalizedPhone.slice(-4)}`,
        phone: normalizedPhone,
        role: 'user',
        isActive: true,
        lastLogin: new Date(),
      });
    } else {
      if (name && (user.name.startsWith('User ') || user.name === 'User')) {
        user.name = name;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT for API authentication
    const token = jwt.sign(
      { id: user._id, uid: user.firebaseUid, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        avatar: user.avatar || '',
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Twilio Verify OTP Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error verifying OTP' });
  }
});

module.exports = router;

