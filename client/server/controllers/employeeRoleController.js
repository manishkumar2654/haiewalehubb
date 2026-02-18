// controllers/employeeRoleController.js
const EmployeeRole = require("../models/EmployeeRole");

// Get all employee roles
exports.getEmployeeRoles = async (req, res, next) => {
  try {
    const roles = await EmployeeRole.find().sort("name");
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// Create new employee role
exports.createEmployeeRole = async (req, res, next) => {
  try {
    let { name, description, permissions } = req.body;

    // ✅ FORCE LOWERCASE
    name = name?.toLowerCase().trim();

    const existingRole = await EmployeeRole.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        message: "Employee role already exists",
      });
    }

    const role = new EmployeeRole({
      name,
      description,
      permissions,
    });

    await role.save();

    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
};

// Update employee role
exports.updateEmployeeRole = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // ✅ FORCE LOWERCASE IF NAME IS BEING UPDATED
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase().trim();
    }

    const role = await EmployeeRole.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!role) {
      return res.status(404).json({
        message: "Employee role not found",
      });
    }

    res.json(role);
  } catch (err) {
    next(err);
  }
};

// Delete employee role
exports.deleteEmployeeRole = async (req, res, next) => {
  try {
    const role = await EmployeeRole.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Employee role not found" });
    }

    res.json({ message: "Employee role deleted successfully" });
  } catch (err) {
    next(err);
  }
};
