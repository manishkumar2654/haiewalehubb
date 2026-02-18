const express = require("express");
const router = express.Router();
const seatController = require("../controllers/seatController");

// ✅ SEAT ROUTES
// Get seats by branch
router.get("/branch/:branchId", seatController.getSeatsByBranch);

// Get seat by ID
router.get("/:id", seatController.getSeatById);

// Create single seat
router.post("/", seatController.createSeat);

// Create multiple seats at once
router.post("/bulk", seatController.bulkCreateSeats);

// Update seat
router.put("/:id", seatController.updateSeat);

// Update seat status only
router.patch("/:id/status", seatController.updateSeatStatus);

// Delete seat
router.delete("/:id", seatController.deleteSeat);

// Get seat statistics for branch
router.get("/stats/:branchId", seatController.getSeatStatistics);

module.exports = router;
