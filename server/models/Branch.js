const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branchType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchType",
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
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
    },
    workingHours: {
      type: String,
      default: "9:00 AM - 9:00 PM",
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      default: 0,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    manager: {
      name: String,
      contact: String,
      email: String,
    },
    facilities: [String],
  },
  { timestamps: true }
);

// Generate branch code before saving
branchSchema.pre("save", async function (next) {
  if (!this.code) {
    const branchType = await mongoose
      .model("BranchType")
      .findById(this.branchType);
    const count = await mongoose
      .model("Branch")
      .countDocuments({ branchType: this.branchType });
    this.code = `${branchType.name.substring(0, 3).toUpperCase()}${(count + 1)
      .toString()
      .padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Branch", branchSchema);
