// routes/billRoutes.js
const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");
const { check, validationResult } = require("express-validator");

// Validation middleware
const validateBill = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  check("customerId")
    .trim()
    .notEmpty()
    .withMessage("Customer ID is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Customer ID must be 10 digits"),
  check("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Invalid phone number"),
  check("gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),
  check("services.*.serviceName")
    .notEmpty()
    .withMessage("Service name is required"),
  check("services.*.price")
    .isFloat({ min: 0 })
    .withMessage("Invalid service price"),
  check("products.*.productName")
    .notEmpty()
    .withMessage("Product name is required"),
  check("products.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Invalid unit price"),
  check("discountPercent")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be 0-100%"),
  check("paymentMethod")
    .isIn(["Cash", "UPI", "Card"])
    .withMessage("Invalid payment method"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// CRUD Routes
router.post("/", validateBill, billController.createBill);
router.get("/", billController.getAllBills);
router.get("/:id", billController.getBill);

// PDF Routes
router.get("/:id/download", billController.downloadPDF);

module.exports = router;
