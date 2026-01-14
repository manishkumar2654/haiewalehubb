const express = require("express");
const router = express.Router();
const walkinController = require("../controllers/walkinController");
const { protect } = require("../middlewares/authMiddleware");
const walkinCaculatorController = require("../controllers/walkinCalculatorController");
// Basic walkin routes
router.post("/", walkinController.createWalkin);
router.get("/", walkinController.getAllWalkins);
router.get("/:id", walkinController.getWalkin);
router.put("/:id", walkinController.updateWalkin);
router.delete("/:id", walkinController.deleteWalkin);
router.put("/:id/complete-update", walkinController.completeUpdateWalkin);

router.post("/:id/add-services", walkinController.addServicesToWalkin);
router.post("/:id/add-products", walkinController.addProductsToWalkin);
router.put("/:id/status", walkinController.updateWalkinStatus);
router.patch("/:id/payment", walkinController.updateWalkinPayment);

// PDF & QR routes
router.get("/:id/pdf", walkinController.generatePDF);
router.get("/:id/qr", walkinController.generateQR);
router.get("/qr/:code", walkinController.getWalkinByQR);
router.get("/qr-download/:walkinId", walkinController.downloadViaQR);

// Branch and staff routes
router.get("/branches/list", walkinController.getBranches);
router.get("/employee-roles", walkinController.getEmployeeRoles);
router.get("/staff/filtered", walkinController.getFilteredStaff);
router.get("/staff/branch", walkinController.getBranchStaff);
router.post("/calculate-price", walkinCaculatorController.calculatePrice);

router.get("/employee/:employeeId", walkinController.getEmployeeWalkins);
module.exports = router;
