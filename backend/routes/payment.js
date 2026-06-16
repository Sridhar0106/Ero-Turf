const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { verifyFirebaseToken } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sxlq1qqXxW2t8j',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'wJqfGU0Ce4vf6EXByuuiQ1mw',
});

// POST /api/payments/create-order — create Razorpay order
router.post('/create-order', verifyFirebaseToken, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const bookingIds = typeof bookingId === 'string'
      ? bookingId.split(',').map(s => s.trim())
      : [bookingId];

    const bookings = await Booking.find({ bookingId: { $in: bookingIds } })
      .populate('turf', 'name')
      .populate('user', 'name email');

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const totalAmount = bookings.reduce((sum, b) => sum + b.pricing.total, 0);
    const slotPriceTotal = bookings.reduce((sum, b) => sum + b.pricing.slotPrice, 0);
    const gstTotal = bookings.reduce((sum, b) => sum + b.pricing.gst, 0);

    const options = {
      amount: totalAmount * 100, // paise (amount in sub-units)
      currency: 'INR',
      receipt: `rcpt_${bookingIds[0].substring(0, 10)}`,
      notes: {
        bookingIds: bookingIds.join(','),
        userId: req.user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create pending payment record
    await Payment.create({
      booking: bookings[0]._id,
      user: req.user.id,
      bookingId: bookingIds.join(','),
      razorpayOrderId: order.id,
      amount: slotPriceTotal * 100,
      gst: gstTotal * 100,
      total: totalAmount * 100,
      status: 'pending',
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sxlq1qqXxW2t8j',
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate payment gateway' });
  }
});

// POST /api/payments/verify — verify Razorpay payment signature
router.post('/verify', verifyFirebaseToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const bookingIds = typeof bookingId === 'string'
      ? bookingId.split(',').map(s => s.trim())
      : [bookingId];

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'wJqfGU0Ce4vf6EXByuuiQ1mw');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Update bookings status
    await Booking.updateMany(
      { bookingId: { $in: bookingIds } },
      { status: 'confirmed' }
    );

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentMethod: 'card', // can be general card, upi, etc.
      }
    );

    const confirmedBookings = await Booking.find({ bookingId: { $in: bookingIds } })
      .populate('turf', 'name location pricing images')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Payment verified and bookings confirmed successfully',
      bookings: confirmedBookings,
    });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, message: 'Signature verification processing failed' });
  }
});

// GET /api/payments/my — user payment history
router.get('/my', verifyFirebaseToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking', 'bookingId date slot turf')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve payment history' });
  }
});

module.exports = router;
