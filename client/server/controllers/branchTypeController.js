const BranchType = require("../models/BranchType");
const Branch = require("../models/Branch");
const mongoose = require("mongoose");

// ✅ GET ALL BRANCH TYPES
exports.getAllBranchTypes = async (req, res) => {
  try {
    const { active, sort } = req.query;

    let filter = {};
    let sortOption = { order: 1, name: 1 };

    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    if (sort === "name") sortOption = { name: 1 };
    if (sort === "order") sortOption = { order: 1 };
    if (sort === "created") sortOption = { createdAt: -1 };

    const branchTypes = await BranchType.find(filter).sort(sortOption);

    // Get count of branches for each type
    const typesWithCounts = await Promise.all(
      branchTypes.map(async (type) => {
        const branchCount = await Branch.countDocuments({
          branchType: type._id,
        });
        return {
          ...type.toObject(),
          branchCount,
        };
      })
    );

    res.json({
      success: true,
      count: branchTypes.length,
      data: typesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET ACTIVE BRANCH TYPES
exports.getActiveBranchTypes = async (req, res) => {
  try {
    const branchTypes = await BranchType.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });

    res.json({
      success: true,
      data: branchTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET BRANCH TYPE BY ID
exports.getBranchTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const branchType = await BranchType.findById(id);

    if (!branchType) {
      return res.status(404).json({
        success: false,
        message: "Branch type not found",
      });
    }

    // Get branches of this type
    const branches = await Branch.find({ branchType: id })
      .select("name code address phone isActive premium")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        ...branchType.toObject(),
        branches,
        branchCount: branches.length,
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

// ✅ CREATE BRANCH TYPE
exports.createBranchType = async (req, res) => {
  try {
    const { name, description, colorCode, icon, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Branch type name is required",
      });
    }

    // Check if branch type already exists
    const existingType = await BranchType.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message: "Branch type with this name already exists",
      });
    }

    const branchType = new BranchType({
      name: name.trim(),
      description: description?.trim() || "",
      colorCode: colorCode || "#3B82F6",
      icon: icon || "",
      order: order || 0,
      isActive: true,
    });

    await branchType.save();

    res.status(201).json({
      success: true,
      message: "Branch type created successfully",
      data: branchType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE BRANCH TYPE
exports.updateBranchType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trim name if provided
    if (updateData.name) {
      updateData.name = updateData.name.trim();

      // Check for duplicate name (case insensitive)
      const existingType = await BranchType.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "Another branch type with this name already exists",
        });
      }
    }

    const branchType = await BranchType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!branchType) {
      return res.status(404).json({
        success: false,
        message: "Branch type not found",
      });
    }

    res.json({
      success: true,
      message: "Branch type updated successfully",
      data: branchType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ DELETE BRANCH TYPE
exports.deleteBranchType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any branch is using this type
    const branchesUsingType = await Branch.countDocuments({ branchType: id });

    if (branchesUsingType > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch type. ${branchesUsingType} branch(es) are using this type.`,
        data: { branchCount: branchesUsingType },
      });
    }

    const branchType = await BranchType.findByIdAndDelete(id);

    if (!branchType) {
      return res.status(404).json({
        success: false,
        message: "Branch type not found",
      });
    }

    res.json({
      success: true,
      message: "Branch type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ TOGGLE BRANCH TYPE STATUS
exports.toggleBranchTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const branchType = await BranchType.findById(id);
    if (!branchType) {
      return res.status(404).json({
        success: false,
        message: "Branch type not found",
      });
    }

    // If deactivating, check if active branches exist
    if (branchType.isActive) {
      const activeBranches = await Branch.countDocuments({
        branchType: id,
        isActive: true,
      });

      if (activeBranches > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate. ${activeBranches} active branch(es) are using this type.`,
          data: { activeBranchCount: activeBranches },
        });
      }
    }

    branchType.isActive = !branchType.isActive;
    await branchType.save();

    res.json({
      success: true,
      message: `Branch type ${
        branchType.isActive ? "activated" : "deactivated"
      } successfully`,
      data: branchType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
