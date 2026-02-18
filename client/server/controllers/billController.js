// controllers/billController.js - CORRECTED VERSION

const Bill = require("../models/Bill");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { validationResult } = require("express-validator");

const pdfDir = path.join(__dirname, "../pdfs");
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// ✅ PDF Generation Function
const generatePDF = (bill) => {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(pdfDir, `${bill.invoiceNumber}.pdf`);
    const doc = new PDFDocument({
      size: [226.77, 800], // 80mm width (thermal printer size)
      margin: 0,
    });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Set fixed-width font
    doc.font("Courier");

    // Header
    doc.fontSize(16).text("STATSAYA", { align: "center" });
    doc.fontSize(10).text("Beauty Salon & Spa", { align: "center" });
    doc.moveDown(0.5);
    doc.text("-".repeat(32), { align: "center" });
    doc.moveDown(1);

    // Customer Info (Left-aligned)
    doc.fontSize(10);
    doc.text(`Name:       ${bill.name}`);
    doc.text(`Customer ID: ${bill.customerId}`);
    doc.text(`Phone:      ${bill.phone}`);
    doc.text(`Gender:     ${bill.gender}`);
    doc.text(`Room No.:   ${bill.roomNo || "-"}`);
    doc.text(`Date:       ${new Date(bill.billingDate).toLocaleDateString()}`);
    doc.text(`Time:       ${bill.billingTime}`);
    doc.moveDown(1);

    // Services Table
    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(12).text("SERVICES PROVIDED", { align: "center" });
    doc.text("-".repeat(32), { align: "center" });
    doc.moveDown(0.5);

    // Table Header
    doc.fontSize(10);
    doc.text("No. Service          Staff Price", { characterSpacing: 1 });
    doc.text("-".repeat(32), { align: "center" });

    // Services Rows
    bill.services.forEach((s, i) => {
      const line = [
        `${(i + 1).toString().padEnd(3)}`,
        `${s.serviceName.substring(0, 12).padEnd(12)}`,
        `${s.staffAssigned.substring(0, 5).padEnd(5)}`,
        `₹${s.total.toFixed(2)}`,
      ].join(" ");

      doc.text(line);
    });

    doc.moveDown(1);

    // Products Table
    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(12).text("PRODUCTS SOLD", { align: "center" });
    doc.text("-".repeat(32), { align: "center" });
    doc.moveDown(0.5);

    // Products Header
    doc.text("No. Product          Qty Price", { characterSpacing: 1 });
    doc.text("-".repeat(32), { align: "center" });

    // Products Rows
    bill.products.forEach((p, i) => {
      const line = [
        `${(i + 1).toString().padEnd(3)}`,
        `${p.productName.substring(0, 12).padEnd(12)}`,
        `${p.quantity.toString().padEnd(3)}`,
        `₹${p.total.toFixed(2)}`,
      ].join(" ");

      doc.text(line);
    });

    // Summary
    doc.moveDown(1);
    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(10);
    doc.text(`Sub Total:       ₹${bill.subTotal.toFixed(2).padStart(10)}`);
    doc.text(
      `Discount (${bill.discountPercent}%): ₹${(bill.subTotal - bill.totalPrice)
        .toFixed(2)
        .padStart(10)}`
    );
    doc.text(`Acharos Amount:  ₹${bill.acharosAmount.toFixed(2).padStart(10)}`);
    doc.text("-".repeat(32), { align: "center" });
    doc
      .fontSize(12)
      .text(`TOTAL: ₹${bill.totalPrice.toFixed(2).padStart(10)}`, {
        underline: true,
      });
    doc.moveDown(1);
    doc.text(`Payment Method: ${bill.paymentMethod}`);
    doc.moveDown(2);

    // Footer
    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(8).text("Thank you for your visit!", { align: "center" });
    doc.text("House No.36, Sec. F-B, Scheme No. 94, Indore", {
      align: "center",
    });
    doc.text("-".repeat(32), { align: "center" });

    // Add printer cut command (ESC/POS)
    doc.text("\x1B@\x1Bm"); // Initialize and cut command

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};

// ✅ Controller Methods
const createBill = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const bill = new Bill(req.body);
    bill.calculateTotals(); // recalculate everything

    const pdfPath = await generatePDF(bill);
    bill.pdfPath = pdfPath;
    await bill.save();

    res.status(201).json({
      message: "Bill created successfully",
      bill,
      pdfUrl: `/pdfs/${path.basename(pdfPath)}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill || !bill.pdfPath)
      return res.status(404).json({ error: "PDF not found" });

    if (!fs.existsSync(bill.pdfPath)) {
      const newPath = await generatePDF(bill);
      bill.pdfPath = newPath;
      await bill.save();
    }

    res.download(bill.pdfPath, `${bill.invoiceNumber}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ SINGLE EXPORT (Sab functions ek saath)
module.exports = {
  createBill,
  getAllBills,
  getBill,
  downloadPDF,
  generatePDF, // ✅ Yeh bhi add karna hai
};
