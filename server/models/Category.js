const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    assignedEmployeeRole: {
      type: String, // e.g., "Manager", "Barber"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
