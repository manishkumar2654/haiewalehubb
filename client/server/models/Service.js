const mongoose = require("mongoose");

// Pricing schema with duration in minutes for easier time calculation
const pricingSchema = new mongoose.Schema({
  duration: { type: String, required: true }, // e.g. "45 Minutes", "1 Hour"
  durationMinutes: { type: Number, required: true }, // for computation, e.g. 45 or 60
  price: { type: Number, required: true },
  label: String, // Gender/type/custom labels e.g. "Male", "Regular", etc.
});

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    benefits: [String],
    pricing: [pricingSchema],
    images: [String], // image URLs or filenames
    tags: [String],
    isActive: { type: Boolean, default: true },

    weekdays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [],
    },

    timeSlots: {
      // Array of objects with startTime in HH:mm format
      // We store only startTime because endTime can be calculated on frontend using related pricing.durationMinutes
      type: [
        {
          startTime: {
            type: String, // "HH:mm", e.g. "09:00"
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
