const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Gold", "Diamond", "Silver"],
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    phone: {
      type: String,
      required: true,
    },
    landline: {
      type: String,
      required: true,
    },
    workingHours: {
      type: String,
      default: "9:00 AM - 9:00 PM",
    },
    rooms: {
      type: String,
      required: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branchSchema);
