const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["Silver", "Gold", "Diamond"],
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
    },
    status: {
      type: String,
      enum: ["Available", "Booked", "Maintenance"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
