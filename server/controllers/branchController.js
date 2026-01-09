const Branch = require("../models/Branch");

// ✅ GET ALL BRANCHES
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ CREATE BRANCH (NO GEOCODING)
// ✅ CREATE BRANCH (MANUAL LAT/LNG SUPPORTED)
exports.createBranch = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      landline,
      rooms,
      premium,
      workingHours,
      location, // { lat, lng } optional
    } = req.body;

    if (!name || !address || !phone || !landline || !rooms) {
      return res.status(400).json({
        message:
          "Missing required fields: name, address, phone, landline, rooms",
      });
    }

    const existingBranch = await Branch.findOne({ name });
    if (existingBranch) {
      return res.status(400).json({
        message: `Branch with name '${name}' already exists`,
      });
    }

    // ✅ Validate manual lat/lng if provided
    let finalLocation;
    if (location?.lat && location?.lng) {
      finalLocation = {
        lat: Number(location.lat),
        lng: Number(location.lng),
      };

      if (isNaN(finalLocation.lat) || isNaN(finalLocation.lng)) {
        return res.status(400).json({
          message: "Latitude and Longitude must be valid numbers",
        });
      }
    }

    const branch = new Branch({
      name,
      address,
      phone,
      landline,
      rooms,
      premium: premium || false,
      workingHours: workingHours || "9:00 AM - 9:00 PM",
      location: finalLocation, // ✅ saved only if provided
    });

    await branch.save();

    res.status(201).json({
      message: "Branch created successfully",
      branch,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ UPDATE BRANCH (MANUAL LAT/LNG SUPPORTED)
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.location?.lat && updateData.location?.lng) {
      updateData.location = {
        lat: Number(updateData.location.lat),
        lng: Number(updateData.location.lng),
      };

      if (isNaN(updateData.location.lat) || isNaN(updateData.location.lng)) {
        return res.status(400).json({
          message: "Latitude and Longitude must be valid numbers",
        });
      }
    }

    const branch = await Branch.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({
      message: "Branch updated successfully",
      branch,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ DELETE BRANCH (SOFT DELETE)
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    console.log(`✅ Branch deactivated: ${branch.name}`);

    res.json({
      message: "Branch deactivated successfully",
      branch,
    });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ GET SINGLE BRANCH
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(branch);
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
