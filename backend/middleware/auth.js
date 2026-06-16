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

const isFirebaseAdminConfigured = () => (
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_CLIENT_EMAIL !== 'your-firebase-client-email' &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PRIVATE_KEY !== 'your-firebase-private-key'
);

// Verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Dev mode: accept dev placeholder and JWT tokens directly
    if (process.env.NODE_ENV === 'development') {
      if (token === 'dev_placeholder_token') {
        let user = await User.findOne({ email: 'dev@eroturf.com' });
        if (!user) {
          user = await User.create({
            firebaseUid: 'dev_user_001',
            name: 'Dev User',
            email: 'dev@eroturf.com',
            phone: '+91 98765 43210',
            role: 'admin',
          });
        }
        req.user = {
          id: user._id,
          uid: user.firebaseUid,
          role: user.role,
          name: user.name,
          email: user.email,
        };
        return next();
      }

      if (token.startsWith('dev_')) {
        try {
          const decoded = jwt.verify(token.replace('dev_', ''), process.env.JWT_SECRET);
          req.user = decoded;
          return next();
        } catch (err) {
          // Proceed to fallback verification
        }
      }
    }

    // First try our own JWT (issued by /auth/verify endpoint)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch {
      // Not our JWT — continue to Firebase verification
    }

    // Try Firebase Admin token verification
    let firebaseUid;
    if (isFirebaseAdminConfigured()) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        firebaseUid = decodedToken.uid;
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Dev mode: Firebase Admin not configured — decode payload without verification
      const payload = decodeJwtPayload(token);
      if (payload && (payload.sub || payload.uid)) {
        firebaseUid = payload.sub || payload.uid;
      } else {
        return res.status(401).json({ success: false, message: 'Invalid token (dev mode)' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Firebase Admin not configured' });
    }

    // Find user in DB by firebaseUid
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please login again.' });
    }

    req.user = {
      id: user._id,
      uid: user.firebaseUid,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { verifyFirebaseToken, requireAdmin };
