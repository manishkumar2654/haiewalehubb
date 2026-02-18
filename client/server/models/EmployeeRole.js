// models/EmployeeRole.js
const mongoose = require("mongoose");

const employeeRoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,

      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [String], // Array of permission strings
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EmployeeRole ||
  mongoose.model("EmployeeRole", employeeRoleSchema);
