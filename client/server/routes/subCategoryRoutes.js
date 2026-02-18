const express = require("express");
const router = express.Router();
const {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} = require("../controllers/subCategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.get("/", getSubcategories);
router.post("/", protect, restrictTo("admin"), createSubcategory);
router.delete("/:id", protect, restrictTo("admin"), deleteSubcategory);

module.exports = router;
