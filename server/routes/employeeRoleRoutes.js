// // routes/employeeRoleRoutes.js
// const express = require("express");
// const router = express.Router();
// const {
//   getEmployeeRoles,
//   createEmployeeRole,
//   updateEmployeeRole,
//   deleteEmployeeRole,
// } = require("../controllers/employeeRoleController");
// const { protect, restrictTo } = require("../middlewares/authMiddleware");

// // All routes require admin access
// router.use(protect, restrictTo("admin"));

// router.route("/").get(getEmployeeRoles).post(createEmployeeRole);

// router.route("/:id").put(updateEmployeeRole).delete(deleteEmployeeRole);

// module.exports = router;





const express = require("express");
const router = express.Router();
const {
  getEmployeeRoles,
  createEmployeeRole,
  updateEmployeeRole,
  deleteEmployeeRole,
} = require("../controllers/employeeRoleController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// ✅ Allow authenticated users to READ roles (needed for UI dropdown/selector)
router.get("/", protect, getEmployeeRoles);

// ✅ Admin-only for create/update/delete
router.post("/", protect, restrictTo("admin"), createEmployeeRole);
router.put("/:id", protect, restrictTo("admin"), updateEmployeeRole);
router.delete("/:id", protect, restrictTo("admin"), deleteEmployeeRole);

module.exports = router;