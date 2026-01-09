const express = require("express");
const router = express.Router();
const pc = require("../controllers/productController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", pc.getProducts);
router.get("/available", pc.getAvailableProducts); // NEW
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.array("images", 4),
  pc.createProduct
);

router.get("/:id", pc.getProductById);
router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  upload.array("images", 4),
  pc.updateProduct
);
router.delete("/:id", protect, restrictTo("admin"), pc.deleteProduct);

// NEW: Product status management routes
router.post("/:id/book", protect, pc.bookProduct);
router.post("/:id/release", protect, restrictTo("admin"), pc.releaseBooked);
router.post("/:id/mark-in-use", protect, restrictTo("admin"), pc.markAsInUse);
router.post(
  "/:id/return-from-use",
  protect,
  restrictTo("admin"),
  pc.returnFromUse
);
router.get("/:id/stock-details", pc.getProductStockDetails);
router.post(
  "/:id/set-in-use",
  protect,
  restrictTo("admin"),
  pc.setInUseQuantity
);
module.exports = router;
