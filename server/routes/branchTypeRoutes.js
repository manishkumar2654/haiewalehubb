const express = require("express");
const router = express.Router();
const branchTypeController = require("../controllers/branchTypeController");

// ✅ BRANCH TYPE ROUTES
router.get("/", branchTypeController.getAllBranchTypes);
router.get("/active", branchTypeController.getActiveBranchTypes);
router.get("/:id", branchTypeController.getBranchTypeById);
router.post("/", branchTypeController.createBranchType);
router.put("/:id", branchTypeController.updateBranchType);
router.delete("/:id", branchTypeController.deleteBranchType);
router.patch("/:id/toggle-status", branchTypeController.toggleBranchTypeStatus);

module.exports = router;
