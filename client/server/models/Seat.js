const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    branchType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchType",
      required: true,
    },
    seatType: {
      type: String,
      enum: ["Regular", "Premium", "VIP", "Couple"],
      default: "Regular",
    },
    status: {
      type: String,
      enum: ["Available", "Booked", "Maintenance", "Reserved"],
      default: "Available",
    },
    position: {
      row: { type: Number },
      column: { type: Number },
      section: { type: String },
    },
    features: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastBooked: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index for unique seat number per branch
seatSchema.index({ seatNumber: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model("Seat", seatSchema);
