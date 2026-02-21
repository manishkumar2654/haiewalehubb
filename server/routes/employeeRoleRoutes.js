// routes/employeeRoleRoutes.js
const express = require("express");
const router = express.Router();
const {
  getEmployeeRoles,
  createEmployeeRole,
  updateEmployeeRole,
  deleteEmployeeRole,
} = require("../controllers/employeeRoleController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// All routes require admin access
router.use(protect, restrictTo("admin"));

router.route("/").get(getEmployeeRoles).post(createEmployeeRole);

router.route("/:id").put(updateEmployeeRole).delete(deleteEmployeeRole);

module.exports = router;




