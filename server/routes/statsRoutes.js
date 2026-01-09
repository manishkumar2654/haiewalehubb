const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Main dashboard statistics
router.get(
  "/",
  protect,
  restrictTo("admin", "manager", "receptionist"),
  statsController.getDashboardStats
);

// Statistics by date range
router.get(
  "/range",
  protect,
  restrictTo("admin", "manager", "receptionist"),
  statsController.getStatsByDateRange
);

// Branch-specific statistics
router.get(
  "/branch/:branchId",
  protect,
  restrictTo("admin", "manager", "receptionist"),
  statsController.getBranchStats
);

// Real-time statistics
router.get(
  "/realtime",
  protect,
  restrictTo("admin", "manager", "receptionist"),
  statsController.getRealTimeStats
);

module.exports = router;
