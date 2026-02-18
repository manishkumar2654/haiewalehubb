const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    type: {
      type: String,
      enum: ["Silver", "Gold", "Diamond"],
      // required: true,
      default: "Silver",
    },
    appointmentDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Cash"],
      default: "Pending",
    },
    servicePrice: { type: Number, required: true },
    roomPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      required: true,
    },
    // New field to track who created the appointment
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
