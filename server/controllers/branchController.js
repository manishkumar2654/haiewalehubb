const Branch = require("../models/Branch");
const BranchType = require("../models/BranchType");
const Seat = require("../models/Seat");
const mongoose = require("mongoose");

// ✅ GET ALL BRANCHES
exports.getAllBranches = async (req, res) => {
  try {
    const { type, active, premium, search } = req.query;

    let filter = {};

    // Apply filters
    if (type) filter.branchType = type;
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;
    if (premium === "true") filter.premium = true;
    if (premium === "false") filter.premium = false;

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const branches = await Branch.find(filter)
      .populate("branchType", "name colorCode icon")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET BRANCH STATISTICS
exports.getBranchStatistics = async (req, res) => {
  try {
    const totalBranches = await Branch.countDocuments();
    const activeBranches = await Branch.countDocuments({ isActive: true });
    const premiumBranches = await Branch.countDocuments({ premium: true });

    // Group by branch type
    const branchesByType = await Branch.aggregate([
      {
        $lookup: {
          from: "branchtypes",
          localField: "branchType",
          foreignField: "_id",
          as: "typeInfo",
        },
      },
      { $unwind: "$typeInfo" },
      {
        $group: {
          _id: "$typeInfo.name",
          count: { $sum: 1 },
          color: { $first: "$typeInfo.colorCode" },
          typeId: { $first: "$typeInfo._id" },
        },
      },
    ]);

    // Get seats statistics
    const seatStats = await Seat.aggregate([
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      { $unwind: "$branchInfo" },
      {
        $group: {
          _id: "$branchInfo._id",
          branchName: { $first: "$branchInfo.name" },
          totalSeats: { $sum: 1 },
          availableSeats: {
            $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        total: totalBranches,
        active: activeBranches,
        inactive: totalBranches - activeBranches,
        premium: premiumBranches,
        byType: branchesByType,
        seatStats: seatStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET BRANCH BY ID
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id).populate(
      "branchType",
      "name colorCode icon description"
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Get seat statistics
    const seatStats = await Seat.aggregate([
      { $match: { branch: branch._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get seats by type
    const seatsByType = await Seat.aggregate([
      { $match: { branch: branch._id } },
      {
        $group: {
          _id: "$seatType",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
      reserved: 0,
      bySeatType: {},
    };

    seatStats.forEach((stat) => {
      stats.total += stat.count;
      stats[stat._id.toLowerCase()] = stat.count;
    });

    seatsByType.forEach((stat) => {
      stats.bySeatType[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        branch,
        statistics: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ CREATE BRANCH
exports.createBranch = async (req, res) => {
  try {
    const {
      name,
      branchType,
      address,
      phone,
      landline,
      workingHours,
      premium,
      manager,
      facilities,
      location,
      isActive,
    } = req.body;

    // Validation
    if (!name || !branchType || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, branchType, address, phone",
      });
    }

    // Check if branch type exists
    const typeExists = await BranchType.findById(branchType);
    if (!typeExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch type",
      });
    }

    // Check for duplicate branch name
    const existingBranch = await Branch.findOne({
      name: name.trim(),
      branchType,
    });

    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: `A ${typeExists.name} branch with name "${name}" already exists`,
      });
    }

    const branch = new Branch({
      name: name.trim(),
      branchType,
      address: address.trim(),
      phone: phone.trim(),
      landline: landline?.trim(),
      workingHours: workingHours || "9:00 AM - 9:00 PM",
      premium: premium || false,
      manager: manager || {},
      facilities: facilities || [],
      location: location || {},
      isActive: isActive !== undefined ? isActive : true,
    });

    await branch.save();

    const populatedBranch = await Branch.findById(branch._id).populate(
      "branchType",
      "name colorCode"
    );

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: populatedBranch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE BRANCH
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.address) updateData.address = updateData.address.trim();
    if (updateData.phone) updateData.phone = updateData.phone.trim();
    if (updateData.landline) updateData.landline = updateData.landline.trim();

    // Validate location
    if (updateData.location) {
      if (updateData.location.lat) {
        updateData.location.lat = Number(updateData.location.lat);
        if (isNaN(updateData.location.lat)) {
          return res.status(400).json({
            success: false,
            message: "Latitude must be a valid number",
          });
        }
      }

      if (updateData.location.lng) {
        updateData.location.lng = Number(updateData.location.lng);
        if (isNaN(updateData.location.lng)) {
          return res.status(400).json({
            success: false,
            message: "Longitude must be a valid number",
          });
        }
      }
    }

    // Check if branch exists
    const existingBranch = await Branch.findById(id);
    if (!existingBranch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    // If name is being changed, check for duplicates
    if (updateData.name && updateData.name !== existingBranch.name) {
      const duplicate = await Branch.findOne({
        name: updateData.name,
        branchType: updateData.branchType || existingBranch.branchType,
        _id: { $ne: id },
      });

      if (duplicate) {
        const typeName = duplicate.branchType?.name || "this type";
        return res.status(400).json({
          success: false,
          message: `A branch with name "${updateData.name}" already exists for ${typeName}`,
        });
      }
    }

    const branch = await Branch.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("branchType", "name colorCode icon");

    res.json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ DELETE BRANCH (SOFT DELETE)
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if branch has active seats
    const activeSeatsCount = await Seat.countDocuments({
      branch: id,
      status: { $in: ["Booked", "Reserved"] },
    });

    if (activeSeatsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch. ${activeSeatsCount} seat(s) are currently booked or reserved.`,
      });
    }

    const totalSeatsCount = await Seat.countDocuments({ branch: id });

    if (totalSeatsCount > 0) {
      // Soft delete - mark as inactive
      const branch = await Branch.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }

      return res.json({
        success: true,
        message: "Branch deactivated successfully (has associated seats)",
        data: branch,
      });
    }

    // If no seats, hard delete
    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ TOGGLE BRANCH STATUS
exports.toggleBranchStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    res.json({
      success: true,
      message: `Branch ${
        branch.isActive ? "activated" : "deactivated"
      } successfully`,
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
