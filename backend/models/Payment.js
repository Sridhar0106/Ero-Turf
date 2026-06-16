const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: String, required: true }, // ERT-YYYY-XXXXXX
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentMethod: {
      type: String,
      enum: ['card', 'google_pay', 'upi', 'other'],
      default: 'card',
    },
    amount: { type: Number, required: true },   // base amount in paise
    gst: { type: Number, required: true },
    total: { type: Number, required: true },    // total in paise
    currency: { type: String, default: 'inr' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
