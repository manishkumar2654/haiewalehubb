const express = require("express");
const router = express.Router();
const branchController = require("../../controllers/branchController");

// ✅ ROUTES
router.get("/", branchController.getAllBranches);
router.get("/stats", branchController.getBranchStatistics);
router.get("/:id", branchController.getBranchById);
router.post("/", branchController.createBranch);
router.put("/:id", branchController.updateBranch);
router.delete("/:id", branchController.deleteBranch);
//router.patch("/:id/toggle-status", branchController.toggleBranchStatus);
module.exports = router;
