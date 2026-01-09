const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/categoryController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");

// Protect + restrict to admin
//router.use(protect, restrictTo("admin"));

// Category CRUD
router
  .route("/")
  .get(categoryController.getCategories)
  .post(categoryController.createCategory);

router
  .route("/:id")
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

// Get roles for dropdown
router.get("/roles/list", categoryController.getEmployeeRoles);

module.exports = router;
