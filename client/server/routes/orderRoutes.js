const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const oc = require("../controllers/orderController");

// Regular user routes
router.route("/").post(protect, oc.createOrder).get(protect, oc.getMyOrders); // This is for users to get their own orders

router.post("/verify-payment", protect, oc.verifyPayment);
router.route("/:id").get(protect, oc.getOrderById);

// Admin routes - moved to separate path
router.get("/admin/all", protect, restrictTo("admin"), oc.getAllOrders); // Changed path
router.patch("/:id/status", protect, restrictTo("admin"), oc.updateOrderStatus);

module.exports = router;
