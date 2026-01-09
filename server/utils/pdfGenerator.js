// utils/pdfGenerator.js

const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateAppointmentPDF = async (appointment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Appointment Receipt - ${appointment.appointmentId}`,
          Author: "SPA & Makeup Salon",
          Subject: "Appointment Receipt",
          Keywords: "appointment,receipt,spa,salon",
          CreationDate: new Date(),
        },
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header with logo
      doc
        .fontSize(24)
        .fillColor("#7f1d1d") // Rose-900
        .font("Helvetica-Bold")
        .text("SPA & MAKEUP SALON", 50, 50, { align: "center" });

      doc
        .fontSize(12)
        .fillColor("#9ca3af") // Gray-400
        .font("Helvetica")
        .text("Premium Beauty & Wellness Services", 50, 80, {
          align: "center",
        });

      // Divider line
      doc
        .strokeColor("#fbbf24") // Amber-400
        .lineWidth(2)
        .moveTo(50, 110)
        .lineTo(550, 110)
        .stroke();

      // Title
      doc
        .fontSize(20)
        .fillColor("#1f2937") // Gray-800
        .font("Helvetica-Bold")
        .text("APPOINTMENT RECEIPT", 50, 130, { align: "center" });

      // Appointment ID
      doc
        .fontSize(16)
        .fillColor("#7f1d1d") // Rose-900
        .font("Helvetica-Bold")
        .text(`Appointment ID: ${appointment.appointmentId}`, 50, 170, {
          align: "center",
        });

      // Date
      doc
        .fontSize(12)
        .fillColor("#6b7280") // Gray-500
        .font("Helvetica")
        .text(
          `Date: ${new Date(appointment.createdAt).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          50,
          200,
          { align: "center" }
        );

      // Customer Details
      doc
        .fontSize(14)
        .fillColor("#374151") // Gray-700
        .font("Helvetica-Bold")
        .text("CUSTOMER DETAILS", 50, 240);

      doc
        .fontSize(12)
        .fillColor("#4b5563") // Gray-600
        .font("Helvetica")
        .text(`Name: ${appointment.userId?.name || "N/A"}`, 50, 265)
        .text(`Email: ${appointment.userId?.email || "N/A"}`, 50, 285)
        .text(`Phone: ${appointment.userId?.phone || "N/A"}`, 50, 305);

      // Service Details
      doc
        .fontSize(14)
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .text("SERVICE DETAILS", 50, 340);

      doc
        .fontSize(12)
        .fillColor("#4b5563")
        .font("Helvetica")
        .text(`Service: ${appointment.serviceId?.name || "N/A"}`, 50, 365)
        .text(
          `Duration: ${
            appointment.serviceId?.pricing?.[0]?.durationMinutes || "N/A"
          } minutes`,
          50,
          385
        );

      // Payment Summary
      doc
        .fontSize(14)
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .text("PAYMENT SUMMARY", 50, 420);

      // Table headers
      doc
        .fontSize(12)
        .fillColor("#6b7280")
        .font("Helvetica-Bold")
        .text("Description", 50, 445)
        .text("Amount", 400, 445, { align: "right" });

      // Table rows
      let y = 470;

      // Service Price
      doc
        .fontSize(12)
        .fillColor("#4b5563")
        .font("Helvetica")
        .text("Service Charges", 50, y)
        .text(`₹${appointment.servicePrice || 0}`, 400, y, { align: "right" });

      y += 20;

      // Room Price
      doc
        .text("Room Charges", 50, y)
        .text(`₹${appointment.roomPrice || 0}`, 400, y, { align: "right" });

      y += 20;

      // Total
      doc
        .fontSize(14)
        .fillColor("#7f1d1d")
        .font("Helvetica-Bold")
        .text("Total Amount", 50, y)
        .text(`₹${appointment.totalPrice || 0}`, 400, y, { align: "right" });

      // Footer
      doc
        .fontSize(10)
        .fillColor("#9ca3af")
        .font("Helvetica")
        .text("Thank you for choosing our services!", 50, 580, {
          align: "center",
        })
        .text("For any queries, contact: 9713326656", 50, 600, {
          align: "center",
        })
        .text("Email: statsaya5353@gmail.com", 50, 620, { align: "center" });

      // Watermark
      doc
        .fillColor("#f3f4f6", 0.2)
        .fontSize(100)
        .font("Helvetica-Bold")
        .rotate(-45)
        .text("SPA SALON", 150, 400)
        .rotate(45);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateAppointmentPDF;
