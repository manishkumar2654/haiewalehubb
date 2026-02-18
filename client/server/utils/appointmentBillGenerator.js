// utils/appointmentBillGenerator.js - NEW FILE BANAYE

const Bill = require("../models/Bill");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const pdfDir = path.join(__dirname, "../pdfs");
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// Appointment se bill create karna
const createBillFromAppointment = async (appointment) => {
  const billData = {
    name: appointment.userId?.name || "Customer",
    customerId:
      appointment.userId?._id?.toString().substring(0, 10) ||
      "CUST-" + Date.now(),
    phone: appointment.userId?.phone || "0000000000",
    gender: "Other",
    roomNo: appointment.roomId?.roomNumber || "N/A",
    date: appointment.appointmentDateTime,

    services: [
      {
        serviceName: appointment.serviceId?.name || "Appointment Service",
        duration: "60 mins",
        staffAssigned: appointment.employeeId?.name || "Staff",
        price: appointment.servicePrice || 0,
        gst: 5,
        discount: 0,
        total: appointment.servicePrice || 0,
      },
    ],

    products: [],

    invoiceNumber: `APP-${appointment.appointmentId}`,
    billingDate: appointment.appointmentDateTime,
    billingTime: new Date(appointment.appointmentDateTime).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ),
    discountPercent: 0,
    paymentMethod: appointment.paymentMethod === "cash" ? "Cash" : "UPI",

    subTotal: appointment.servicePrice + (appointment.roomPrice || 0),
    acharosAmount: 0,
    totalPrice: appointment.totalPrice || 0,
  };

  const bill = new Bill(billData);
  bill.calculateTotals();
  await bill.save();
  return bill;
};

// Simple PDF generate function
const generateAppointmentBillPDF = async (appointment) => {
  const bill = await createBillFromAppointment(appointment);

  return new Promise((resolve, reject) => {
    const pdfPath = path.join(pdfDir, `${bill.invoiceNumber}.pdf`);
    const doc = new PDFDocument({
      size: [226.77, 800],
      margin: 0,
    });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.font("Courier");
    doc.fontSize(16).text("STATSAYA", { align: "center" });
    doc.fontSize(10).text("Appointment Bill", { align: "center" });
    doc.moveDown(0.5);
    doc.text("-".repeat(32), { align: "center" });
    doc.moveDown(1);

    doc.fontSize(10);
    doc.text(`Appointment ID: ${appointment.appointmentId}`);
    doc.text(`Customer: ${bill.name}`);
    doc.text(`Phone: ${bill.phone}`);
    doc.text(`Room: ${bill.roomNo}`);
    doc.text(`Date: ${new Date(bill.billingDate).toLocaleDateString()}`);
    doc.text(`Time: ${bill.billingTime}`);
    doc.moveDown(1);

    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(12).text("SERVICE", { align: "center" });
    doc.text("-".repeat(32), { align: "center" });
    doc.moveDown(0.5);

    doc.text("1. " + bill.services[0].serviceName);
    doc.text(`   Duration: ${bill.services[0].duration}`);
    doc.text(`   Staff: ${bill.services[0].staffAssigned}`);
    doc.moveDown(1);

    doc.text("-".repeat(32), { align: "center" });
    doc.fontSize(10);
    doc.text(`Service Price: ₹${bill.services[0].price.toFixed(2)}`);
    doc.text(`Sub Total:     ₹${bill.subTotal.toFixed(2)}`);
    doc.text(`Total:         ₹${bill.totalPrice.toFixed(2)}`, {
      underline: true,
    });
    doc.moveDown(1);

    doc.text(`Payment: ${bill.paymentMethod}`);
    doc.text(`Status: ${appointment.paymentStatus}`);
    doc.moveDown(2);

    doc.text("Thank you for your visit!", { align: "center" });
    doc.text("-".repeat(32), { align: "center" });

    doc.end();
    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
};

module.exports = { createBillFromAppointment, generateAppointmentBillPDF };
