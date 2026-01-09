const express = require("express");
const router = express.Router();
const Room = require("../../models/Room");
const Branch = require("../../models/Branch");

// Create room (with branch validation)
router.post("/", async (req, res, next) => {
  try {
    const { roomNumber, type, branch, price, capacity, status } = req.body;

    // Validation
    if (!roomNumber || !type || !branch || !price) {
      return res.status(400).json({
        message: "Room number, type, branch, and price are required",
      });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        message: "Room number already exists",
      });
    }

    // Validate branch exists
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    // Create room
    const room = await Room.create({
      roomNumber,
      type,
      branch,
      price: Number(price),
      capacity: capacity || 1,
      status: status || "Available",
    });

    // Populate branch details
    const populatedRoom = await Room.findById(room._id).populate(
      "branch",
      "name address phone landline"
    );

    res.status(201).json({
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (err) {
    next(err);
  }
});

// Get all rooms with branch details
router.get("/", async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .populate("branch", "name address phone landline")
      .sort({ type: 1, roomNumber: 1 });

    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// Get rooms by branch ID
router.get("/branch/:branchId", async (req, res, next) => {
  try {
    const { branchId } = req.params;

    const rooms = await Room.find({ branch: branchId })
      .populate("branch", "name address phone landline")
      .sort({ roomNumber: 1 });

    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// Get single room by id with branch details
router.get("/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "branch",
      "name address phone landline"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    next(err);
  }
});

// Update room
router.put("/:id", async (req, res, next) => {
  try {
    const { roomNumber, type, branch, price, capacity, status } = req.body;

    // Check if room exists
    const existingRoom = await Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    // If room number is being changed, check if new number exists
    if (roomNumber && roomNumber !== existingRoom.roomNumber) {
      const duplicateRoom = await Room.findOne({ roomNumber });
      if (duplicateRoom) {
        return res.status(400).json({
          message: "Room number already exists",
        });
      }
    }

    // If branch is being changed, validate new branch exists
    if (branch && branch !== existingRoom.branch.toString()) {
      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(404).json({
          message: "Branch not found",
        });
      }
    }

    // Update room
    const updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (type) updateData.type = type;
    if (branch) updateData.branch = branch;
    if (price) updateData.price = Number(price);
    if (capacity) updateData.capacity = Number(capacity);
    if (status) updateData.status = status;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("branch", "name address phone landline");

    res.json({
      message: "Room updated successfully",
      room,
    });
  } catch (err) {
    next(err);
  }
});

// Delete room
router.delete("/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      message: "Room deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
