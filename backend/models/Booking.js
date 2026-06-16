const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const generateBookingId = () => {
  const year = new Date().getFullYear();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `ERT-${year}-${num}`;
};

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      default: generateBookingId,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    slot: { type: String, required: true }, // '06:00 AM'
    slots: { type: [String], default: [] },
    session: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    duration: { type: Number, default: 1 }, // hours
    team: {
      teamName: { type: String, required: true },
      captainName: { type: String, required: true },
      mobile: { type: String, required: true },
      players: { type: Number, required: true },
    },
    pricing: {
      slotPrice: { type: Number, required: true },
      gst: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    qrCode: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ turf: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
