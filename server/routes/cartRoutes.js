const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Main cart routes
router
  .route("/")
  .get(protect, getCart) // GET /api/v1/cart - Get user's cart
  .post(protect, addToCart) // POST /api/v1/cart - Add item to cart
  .delete(protect, clearCart); // DELETE /api/v1/cart - Clear entire cart

// Single item routes
router
  .route("/:itemId")
  .patch(protect, updateCartItem) // PATCH /api/v1/cart/:itemId - Update item quantity
  .delete(protect, removeFromCart); // DELETE /api/v1/cart/:itemId - Remove specific item

module.exports = router;
