const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema(
  {
    turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf', required: true },
    date: { type: String, required: true },   // 'YYYY-MM-DD'
    slot: { type: String, required: true },   // '06:00 AM'
    session: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'blocked', 'limited'],
      default: 'available',
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blockedReason: { type: String },
  },
  { timestamps: true }
);

timeSlotSchema.index({ turf: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
