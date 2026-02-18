const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const roleDeptCodeMap = {
  manager: "MGR",
  receptionist: "REC",
  servicestaff: "SVC",
};
const addressSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g., Home, Office
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "employee"],
      default: "user",
    },
    // Employee-specific fields
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "employee";
      },
    },
    employeeRole: {
      type: String,
      // enum: ["manager", "receptionist", "servicestaff"],
      required: function () {
        return this.role === "employee";
      },
    },
    shift: {
      type: String,
      enum: ["morning", "night"],
      required: function () {
        return this.role === "employee";
      },
    },
    workingLocation: {
      type: String,
      required: function () {
        return this.role === "employee";
      },
    },
    status: {
      type: String,
      enum: ["occupied", "free"],
      required: function () {
        return this.role === "employee" && this.employeeRole === "servicestaff";
      },
      default: "free",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [addressSchema],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: String,
        color: String,
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Function to generate employeeId following format: EMP-YYYY-DEPT-XXXX
function generateEmployeeId() {
  const prefix = "EMP";
  const timestamp = Date.now().toString(36).toUpperCase(); // base36 encoded timestamp
  const randomStr = [...Array(4)]
    .map(() =>
      Math.floor(Math.random() * 36)
        .toString(36)
        .toUpperCase()
    )
    .join("");

  return `${prefix}-${timestamp}-${randomStr}`;
}

userSchema.pre("validate", function (next) {
  if (this.role === "employee" && !this.employeeId) {
    try {
      this.employeeId = generateEmployeeId();
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT auth token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

const User = mongoose.model("User", userSchema);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
module.exports.generateEmployeeId = generateEmployeeId;
