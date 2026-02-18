const Seat = require("../models/Seat");
const Branch = require("../models/Branch");
const BranchType = require("../models/BranchType");
const mongoose = require("mongoose");
// ✅ GET SEATS BY BRANCH
exports.getSeatsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status, seatType, active } = req.query;

    let filter = { branch: branchId };

    // Apply filters if provided
    if (status) filter.status = status;
    if (seatType) filter.seatType = seatType;
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const seats = await Seat.find(filter)
      .populate("branch", "name code address phone")
      .populate("branchType", "name colorCode icon")
      .sort({ seatNumber: 1 });

    res.json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET SEAT BY ID
exports.getSeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findById(id)
      .populate("branch", "name code")
      .populate("branchType", "name");

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    res.json({
      success: true,
      data: seat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ CREATE SINGLE SEAT
exports.createSeat = async (req, res) => {
  try {
    const { seatNumber, branch, seatType, status, features, notes, position } =
      req.body;

    // Validation
    if (!seatNumber || !branch) {
      return res.status(400).json({
        success: false,
        message: "Seat number and branch are required",
      });
    }

    // Check if branch exists
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    // Check for duplicate seat number in same branch
    const existingSeat = await Seat.findOne({
      seatNumber: seatNumber.trim(),
      branch,
    });

    if (existingSeat) {
      return res.status(400).json({
        success: false,
        message: `Seat number ${seatNumber} already exists in this branch`,
      });
    }

    const seat = new Seat({
      seatNumber: seatNumber.trim(),
      branch,
      branchType: branchExists.branchType,
      seatType: seatType || "Regular",
      status: status || "Available",
      features: features || [],
      notes,
      position: position || {},
    });

    await seat.save();

    // Update branch seat counts
    await updateBranchSeatCounts(branch);

    // Populate and return
    const populatedSeat = await Seat.findById(seat._id)
      .populate("branch", "name code")
      .populate("branchType", "name");

    res.status(201).json({
      success: true,
      message: "Seat created successfully",
      data: populatedSeat,
    });
  } catch (error) {
    console.log("❌ Error creating seat:", error),
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
  }
};

// ✅ BULK CREATE SEATS
exports.bulkCreateSeats = async (req, res) => {
  try {
    const { branchId, seats: seatData } = req.body;

    if (!branchId || !seatData || !Array.isArray(seatData)) {
      return res.status(400).json({
        success: false,
        message: "Branch ID and seats array are required",
      });
    }

    // Check if branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch ID",
      });
    }

    const createdSeats = [];
    const errors = [];

    // Process each seat
    for (const seatInfo of seatData) {
      try {
        if (!seatInfo.seatNumber) {
          errors.push(
            `Missing seat number at index ${seatData.indexOf(seatInfo)}`
          );
          continue;
        }

        // Check for duplicate
        const existing = await Seat.findOne({
          seatNumber: seatInfo.seatNumber.trim(),
          branch: branchId,
        });

        if (existing) {
          errors.push(`Seat ${seatInfo.seatNumber} already exists`);
          continue;
        }

        const seat = new Seat({
          seatNumber: seatInfo.seatNumber.trim(),
          branch: branchId,
          branchType: branch.branchType,
          seatType: seatInfo.seatType || "Regular",
          status: seatInfo.status || "Available",
          features: seatInfo.features || [],
          position: seatInfo.position || {},
        });

        await seat.save();
        createdSeats.push(seat);
      } catch (err) {
        errors.push(`Seat ${seatInfo.seatNumber}: ${err.message}`);
      }
    }

    // Update branch seat counts
    await updateBranchSeatCounts(branchId);

    res.status(201).json({
      success: true,
      message: "Bulk seat creation completed",
      created: createdSeats.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      data: createdSeats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE SEAT
exports.updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find seat first
    const existingSeat = await Seat.findById(id);
    if (!existingSeat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    // If seat number is being changed, check for duplicates
    if (
      updateData.seatNumber &&
      updateData.seatNumber !== existingSeat.seatNumber
    ) {
      const duplicate = await Seat.findOne({
        seatNumber: updateData.seatNumber.trim(),
        branch: existingSeat.branch,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Seat number ${updateData.seatNumber} already exists in this branch`,
        });
      }

      updateData.seatNumber = updateData.seatNumber.trim();
    }

    const seat = await Seat.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("branch", "name code")
      .populate("branchType", "name");

    // Update branch seat counts if status changed
    if (updateData.status) {
      await updateBranchSeatCounts(seat.branch._id);
    }

    res.json({
      success: true,
      message: "Seat updated successfully",
      data: seat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE SEAT STATUS
exports.updateSeatStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["Available", "Booked", "Maintenance", "Reserved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const seat = await Seat.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === "Booked" ? { lastBooked: new Date() } : {}),
      },
      { new: true }
    )
      .populate("branch", "name code")
      .populate("branchType", "name");

    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    // Update branch seat counts
    await updateBranchSeatCounts(seat.branch._id);

    res.json({
      success: true,
      message: `Seat status updated to ${status}`,
      data: seat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ DELETE SEAT
exports.deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findById(id);
    if (!seat) {
      return res.status(404).json({
        success: false,
        message: "Seat not found",
      });
    }

    const branchId = seat.branch;
    await seat.deleteOne();

    // Update branch seat counts
    await updateBranchSeatCounts(branchId);

    res.json({
      success: true,
      message: "Seat deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET SEAT STATISTICS FOR BRANCH
exports.getSeatStatistics = async (req, res) => {
  try {
    const { branchId } = req.params;

    const stats = await Seat.aggregate([
      { $match: { branch: mongoose.Types.ObjectId(branchId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the response
    const formattedStats = {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
      reserved: 0,
      bySeatType: {},
      byStatus: {},
    };

    // Process status counts
    stats.forEach((stat) => {
      formattedStats.total += stat.count;
      formattedStats[stat._id.toLowerCase()] = stat.count;
      formattedStats.byStatus[stat._id] = stat.count;
    });

    // Get counts by seat type
    const typeStats = await Seat.aggregate([
      { $match: { branch: mongoose.Types.ObjectId(branchId) } },
      {
        $group: {
          _id: "$seatType",
          count: { $sum: 1 },
        },
      },
    ]);

    typeStats.forEach((stat) => {
      formattedStats.bySeatType[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ HELPER FUNCTION: Update branch seat counts
async function updateBranchSeatCounts(branchId) {
  try {
    const seatStats = await Seat.aggregate([
      { $match: { branch: mongoose.Types.ObjectId(branchId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let total = 0;
    let available = 0;

    seatStats.forEach((stat) => {
      total += stat.count;
      if (stat._id === "Available") {
        available = stat.count;
      }
    });

    await Branch.findByIdAndUpdate(branchId, {
      totalSeats: total,
      availableSeats: available,
    });

    console.log(
      `✅ Updated seat counts for branch ${branchId}: Total=${total}, Available=${available}`
    );
  } catch (error) {
    console.error("❌ Error updating branch seat counts:", error.message);
  }
}
