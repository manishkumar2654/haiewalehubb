const express = require("express");
const router = express.Router();
const {
  getProductCategories,
  createProductCategory,
  deleteProductCategory,
} = require("../controllers/productCategoryController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

router.get("/", getProductCategories);
router.post("/", protect, restrictTo("admin"), createProductCategory);
router.delete("/:id", protect, restrictTo("admin"), deleteProductCategory);

module.exports = router;
