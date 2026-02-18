const Category = require("../models/Category");
const EmployeeRole = require("../models/EmployeeRole"); // For fetching roles

// CREATE
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// LIST
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort("order");
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(204).json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

// GET AVAILABLE EMPLOYEE ROLES
exports.getEmployeeRoles = async (req, res, next) => {
  try {
    const roles = await EmployeeRole.find({ isActive: true }).sort("name");
    res.json(roles);
  } catch (err) {
    next(err);
  }
};
