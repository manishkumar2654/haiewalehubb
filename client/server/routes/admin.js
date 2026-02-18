const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateEmployeeId } = require("../models/User");
const AppError = require("../utils/appError");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController");
const { logAction } = require("../utils/actionLogger");
// GET /api/admin/users - Search users by email, shift, workingLocation, role
router.get("/users", protect, restrictTo("admin"), async (req, res, next) => {
  try {
    const { email, shift, workingLocation, role } = req.query;
    const filter = {};
    if (email) filter.email = { $regex: email, $options: "i" };
    if (shift) filter.shift = shift;
    if (workingLocation)
      filter.workingLocation = { $regex: workingLocation, $options: "i" };
    if (role) filter.role = role; // Filter by role (e.g., "employee")

    const users = await User.find(filter).select("-password");
    res.status(200).json({ status: "success", users });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:userId - Update user details
router.put(
  "/users/:userId",
  protect,
  restrictTo("admin"),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const updatableFields = [
        "role",
        "employeeRole",
        "shift",
        "workingLocation",
        "status",
      ];

      const user = await User.findById(userId);
      if (!user) return next(new AppError("User not found", 404));

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      });

      // Auto-generate employeeId if role is employee and employeeId missing or empty
      if (
        user.role === "employee" &&
        (!user.employeeId || user.employeeId.trim() === "")
      ) {
        user.employeeId = generateEmployeeId();
      }

      await user.save();

      logAction("USER", "ADMIN_UPDATE", req.user?.email || "anonymous", {
        targetUserId: String(userId),
        targetEmail: user.email,
        role: user.role,
      });

      res.status(200).json({ status: "success", user });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/users/:userId - Delete user
router.delete(
  "/users/:userId",
  protect,
  restrictTo("admin"),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return next(new AppError("User not found", 404));

      const deletedEmail = user.email;
      await user.deleteOne();

      logAction("USER", "ADMIN_DELETE", req.user?.email || "anonymous", {
        targetUserId: String(userId),
        targetEmail: deletedEmail,
      });

      res
        .status(200)
        .json({ status: "success", message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);
router.get(
  "/stats",
  protect,
  restrictTo("admin", "manager", "receptionist"),
  statsController.getDashboardStats
);
module.exports = router;
