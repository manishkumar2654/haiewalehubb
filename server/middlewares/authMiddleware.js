const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");

// 🔐 Protect routes (Authentication)
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Authentication required. Token missing.", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists.", 401));
    }

    // Password changed after token issued
    if (user.changedPasswordAfter?.(decoded.iat)) {
      return next(
        new AppError("Password changed recently. Please login again.", 401)
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

// 🔒 Role-based Authorization
// 🔒 Role-based Authorization (Admin + Employee Roles supported)
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const userRole = req.user.role; // admin | employee | user
    const employeeRole = req.user.employeeRole; // manager | receptionist | servicestaff
    console.log("AUTH CHECK:", {
      role: req.user.role,
      employeeRole: req.user.employeeRole,
      allowedRoles,
    });
    const isAllowed =
      allowedRoles.includes(userRole) ||
      (userRole === "employee" && allowedRoles.includes(employeeRole));

    if (!isAllowed) {
      return next(
        new AppError("You do not have permission for this action", 403)
      );
    }

    next();
  };
};

// 📧 Email verification check
exports.isEmailVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return next(new AppError("Please verify your email to continue", 403));
  }
  next();
};

// 📞 Phone verification check
exports.isPhoneVerified = (req, res, next) => {
  if (!req.user?.isPhoneVerified) {
    return next(
      new AppError("Please verify your phone number to continue", 403)
    );
  }
  next();
};
