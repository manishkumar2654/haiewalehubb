const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middlewares/authMiddleware");
const {
  createBillFromAppointment,
} = require("../utils/appointmentToBillConverter");
const billController = require("../controllers/billController"); // ✅ Aapka existing bill PDF generator
const Appointment = require("../models/Appointment");
const Bill = require("../models/Bill");
const fs = require("fs");
const path = require("path");

// ===== ROUTES DEFINITION =====

// 1. Appointment Creation & Management
router.post("/auto-assign", protect, appointmentController.autoAssign);
router.post(
  "/verify-payment",
  protect,
  appointmentController.verifyAppointmentPayment
);

// 2. Appointment Details & Search
router.get(
  "/details/:appointmentId",
  appointmentController.getAppointmentDetails
);
router.get(
  "/download-pdf/:appointmentId",
  appointmentController.downloadAppointmentPDF
);

// 3. Appointment Status & Payment Management
router.put(
  "/:appointmentId/complete",
  protect,
  appointmentController.completeAppointment
);
router.put(
  "/:appointmentId/status",
  protect,
  appointmentController.updateAppointmentStatus
);
router.put(
  "/:appointmentId/payment-status",
  protect,
  appointmentController.updatePaymentStatus
);

// 4. Employee Assignment
router.get(
  "/:appointmentId/available-employees",
  protect,
  appointmentController.getAvailableEmployees
);
router.post(
  "/:appointmentId/assign-employee",
  protect,
  appointmentController.assignEmployeeToAppointment
);

// 5. Availability
router.get("/availability", appointmentController.getAvailability);

// 6. Admin Appointments (with filters)
// routes/appointmentRoutes.js - Line ~115 (admin/appointments route) UPDATE KARO:

router.get("/admin/appointments", async (req, res) => {
  console.log("Received request with query:", req.query);
  try {
    const { search, status, startDate, endDate } = req.query;
    let filter = {};
    console.log("Initial filter:", filter);

    // Search filter
    if (search) {
      console.log("Adding search filter for:", search);
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { appointmentId: searchRegex },
        { "serviceId.name": searchRegex },
        { "userId.name": searchRegex },
        { "employeeId.name": searchRegex },
      ];
    }

    // Status filter
    if (status && status !== "All") {
      console.log("Adding status filter:", status);
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      console.log("Adding date filters - start:", startDate, "end:", endDate);
      filter.appointmentDateTime = {};
      if (startDate) {
        const start = new Date(startDate);
        console.log("Parsed start date:", start);
        filter.appointmentDateTime.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        console.log("Parsed end date:", end);
        filter.appointmentDateTime.$lte = end;
      }
    }

    console.log("Final filter before query:", JSON.stringify(filter, null, 2));

    // ✅ CRITICAL CHANGE: Add branch populate here
    const appointments = await Appointment.find(filter)
      .populate("userId", "name email phone")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate("serviceId", "name category price durationMinutes")
      .populate({
        path: "roomId",
        populate: {
          // ✅ YEH ADD KARO
          path: "branch",
          select: "name address phone landline workingHours",
        },
      })
      .populate("createdBy", "name employeeRole role")
      .sort({ appointmentDateTime: -1 })
      .lean();

    console.log(
      "✅ Successfully populated appointments with branch:",
      appointments.length
    );

    // Debug: Check first appointment's branch
    if (appointments.length > 0) {
      console.log("✅ First appointment room:", appointments[0].roomId);
      console.log(
        "✅ First appointment branch:",
        appointments[0].roomId?.branch
      );
    }

    res.json(appointments);
  } catch (error) {
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors,
    });
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
});
// 7. User Appointments
router.get("/users/:id/appointments", async (req, res) => {
  try {
    const { timeRange } = req.query;
    const filter = { userId: req.params.id };

    if (timeRange === "upcoming") {
      filter.appointmentDateTime = { $gte: new Date() };
    } else if (timeRange === "past") {
      filter.appointmentDateTime = { $lt: new Date() };
    }

    const appointments = await Appointment.find(filter)
      .populate("userId", "name email phone")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate("serviceId", "name category price durationMinutes pricing")
      .populate("roomId", "roomNumber type location price")
      .populate("createdBy", "name employeeRole role")
      .sort({ appointmentDateTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Error in user appointments route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});

// 8. Employee Appointments - FIXED VERSION
router.get("/employees/:employeeId/appointments", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, startDate, endDate, timeRange } = req.query;

    console.log("📋 Fetching appointments for employee:", employeeId);
    console.log("🔍 Query parameters:", {
      status,
      startDate,
      endDate,
      timeRange,
    });

    // Build filter - only appointments assigned to this employee
    let filter = {
      employeeId: employeeId,
      status: { $ne: "Cancelled" }, // Optionally exclude cancelled appointments
    };

    // Status filter
    if (status && status !== "all" && status !== "All") {
      filter.status = status;
    }

    // Time range filter
    if (timeRange === "upcoming") {
      filter.appointmentDateTime = { $gte: new Date() };
    } else if (timeRange === "past") {
      filter.appointmentDateTime = { $lt: new Date() };
    }

    // Date range filter (overrides timeRange if both provided)
    if (startDate || endDate) {
      filter.appointmentDateTime = {};
      if (startDate) {
        filter.appointmentDateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.appointmentDateTime.$lte = new Date(endDate);
      }
    }

    console.log("🎯 Final filter:", JSON.stringify(filter, null, 2));

    const appointments = await Appointment.find(filter)
      .populate("userId", "name email phone")
      .populate("serviceId", "name description price durationMinutes category")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate("roomId", "roomNumber type location")
      .populate("createdBy", "name employeeRole role")
      .sort({ appointmentDateTime: 1 });

    console.log(
      `✅ Found ${appointments.length} appointments for employee ${employeeId}`
    );

    // Log each appointment for debugging
    appointments.forEach((app, index) => {
      console.log(`📅 Appointment ${index + 1}:`, {
        id: app._id,
        appointmentId: app.appointmentId,
        service: app.serviceId?.name,
        client: app.userId?.name,
        employee: app.employeeId?.name,
        status: app.status,
        date: app.appointmentDateTime,
        room: app.roomId?.roomNumber,
      });
    });

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching employee appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee appointments",
      error: error.message,
    });
  }
});

// 9. Single appointment by ID (legacy route)
router.get("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("employeeId", "name employeeId")
      .populate("serviceId")
      .populate("roomId")
      .populate("createdBy", "name employeeRole role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment details
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const appointment = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing category")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate("roomId", "roomNumber type location price")
      .populate("createdBy", "name employeeRole role");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
  }
});
// routes/appointmentRoutes.js - FULL CORRECTED CODE

router.get("/download-receipt/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // 1. Appointment fetch
    const appointment = await Appointment.findOne({ appointmentId })
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing")
      .populate("roomId", "roomNumber location")
      .populate("employeeId", "name employeeId employeeRole");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // 2. ✅ FIRST: Check if bill already exists
    let bill = await Bill.findOne({ invoiceNumber: `APP-${appointmentId}` });

    if (!bill) {
      console.log("📝 Creating new bill for appointment:", appointmentId);

      // Bill data prepare karo
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

        // ✅ IMPORTANT: Use appointment ID as invoice number
        invoiceNumber: `APP-${appointmentId}`,
        billingDate: appointment.appointmentDateTime,
        billingTime: new Date(
          appointment.appointmentDateTime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        discountPercent: 0,
        paymentMethod: appointment.paymentMethod === "cash" ? "Cash" : "UPI",

        subTotal: appointment.servicePrice + (appointment.roomPrice || 0),
        acharosAmount: 0,
        totalPrice: appointment.totalPrice || 0,
      };

      // ✅ Create bill
      bill = new Bill(billData);
      bill.calculateTotals();

      // ✅ Save bill (with try-catch for duplicate)
      try {
        await bill.save();
        console.log("✅ Bill created successfully:", bill.invoiceNumber);
      } catch (saveError) {
        // Agar save mein error aaye (duplicate), toh existing bill fetch karo
        if (saveError.code === 11000) {
          console.log("⚠️ Bill already exists, fetching existing one...");
          bill = await Bill.findOne({ invoiceNumber: `APP-${appointmentId}` });
          if (!bill) {
            throw new Error(
              "Failed to fetch existing bill after duplicate error"
            );
          }
        } else {
          throw saveError;
        }
      }
    } else {
      console.log("✅ Existing bill found:", bill.invoiceNumber);
    }

    // 3. ✅ Generate PDF if doesn't exist
    if (!bill.pdfPath || !fs.existsSync(bill.pdfPath)) {
      console.log("📄 Generating PDF for bill:", bill.invoiceNumber);
      const pdfPath = await billController.generatePDF(bill);
      bill.pdfPath = pdfPath;
      await bill.save();
      console.log("✅ PDF generated:", pdfPath);
    } else {
      console.log("✅ PDF already exists:", bill.pdfPath);
    }

    // 4. ✅ Set response headers
    const userAgent = req.headers["user-agent"] || "";
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );

    const filename = `appointment-${appointmentId}-bill.pdf`;

    if (isMobile) {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fs.statSync(bill.pdfPath).size,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Access-Control-Allow-Origin": "*",
      });
    } else {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fs.statSync(bill.pdfPath).size,
      });
    }

    // 5. ✅ Send file
    const fileStream = fs.createReadStream(bill.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("❌ Error generating appointment bill PDF:", error);

    // ✅ Better error handling
    if (error.code === 11000) {
      console.log("🔄 Trying alternative approach...");

      try {
        // Alternative: Use existing bill directly
        const existingBill = await Bill.findOne({
          invoiceNumber: `APP-${req.params.appointmentId}`,
        });

        if (
          existingBill &&
          existingBill.pdfPath &&
          fs.existsSync(existingBill.pdfPath)
        ) {
          console.log("✅ Found existing bill with PDF");
          return res.download(
            existingBill.pdfPath,
            `appointment-${req.params.appointmentId}-bill.pdf`
          );
        }

        // Alternative 2: Generate simple PDF directly
        const appointment = await Appointment.findOne({
          appointmentId: req.params.appointmentId,
        })
          .populate("userId", "name email phone")
          .populate("serviceId", "name description pricing");

        if (appointment) {
          console.log("🔄 Generating simple PDF directly...");
          const PDFDocument = require("pdfkit");
          const doc = new PDFDocument();

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="appointment-${req.params.appointmentId}.pdf"`,
          });

          doc.pipe(res);

          // Simple PDF content
          doc.fontSize(16).text("APPOINTMENT BILL", { align: "center" });
          doc.moveDown();
          doc.fontSize(12).text(`Appointment ID: ${req.params.appointmentId}`);
          doc.text(`Customer: ${appointment.userId?.name || "N/A"}`);
          doc.text(`Service: ${appointment.serviceId?.name || "N/A"}`);
          doc.text(`Amount: ₹${appointment.totalPrice || 0}`);
          doc.text(
            `Date: ${appointment.appointmentDateTime.toLocaleDateString()}`
          );
          doc.moveDown();
          doc.text("Thank you for your business!", { align: "center" });

          doc.end();
          return;
        }
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
      }
    }

    // Send error response
    res.status(500).json({
      success: false,
      message: "Error generating bill PDF",
      error: error.message,
      code: error.code,
    });
  }
});
// ✅ ALTERNATIVE: Direct download existing bill
router.get("/download-bill/:appointmentId", async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Bill search karein appointment ID se
    const bill = await Bill.findOne({
      invoiceNumber: `APP-${appointmentId}`,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found for this appointment",
      });
    }

    // Existing billController ka download function use karein
    if (!bill.pdfPath || !fs.existsSync(bill.pdfPath)) {
      // Agar PDF nahi hai toh generate karein
      const pdfPath = await createBillFromAppointment(appointment); // ✅ CHANGE THIS LINE
      bill.pdfPath = pdfPath;
      await bill.save();
    }

    // Check if mobile device
    const userAgent = req.headers["user-agent"] || "";
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );

    if (isMobile) {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${bill.invoiceNumber}.pdf"`,
        "Content-Length": fs.statSync(bill.pdfPath).size,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
    } else {
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${bill.invoiceNumber}.pdf"`,
        "Content-Length": fs.statSync(bill.pdfPath).size,
      });
    }

    const fileStream = fs.createReadStream(bill.pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading bill:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading bill PDF",
    });
  }
});
module.exports = router;
