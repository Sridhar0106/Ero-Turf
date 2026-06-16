const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      pincode: { type: String },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    images: [{ type: String }],
    capacity: { type: Number, default: 22 },
    features: [{ type: String }],
    pricing: {
      morning: { type: Number, default: 800 },   // 6AM - 12PM per hour
      afternoon: { type: Number, default: 700 }, // 12PM - 6PM per hour
      evening: { type: Number, default: 1000 },  // 6PM - 12AM per hour
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

turfSchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }
});

module.exports = mongoose.model('Turf', turfSchema);
