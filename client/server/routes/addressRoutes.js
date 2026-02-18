const express = require("express");
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");
const { protect } = require("../middlewares/authMiddleware");

// All routes protected, user must be logged in
router.get("/", protect, getAddresses);
router.post("/", protect, addAddress);
router.put("/:addressId", protect, updateAddress);
router.delete("/:addressId", protect, deleteAddress);

module.exports = router;
