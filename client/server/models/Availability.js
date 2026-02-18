const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Available", "Booked"],
      default: "Available",
    },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  },
  { timestamps: true }
);

// Add index for faster queries
availabilitySchema.index({
  roomId: 1,
  startDateTime: 1,
  endDateTime: 1,
});

module.exports = mongoose.model("Availability", availabilitySchema);
