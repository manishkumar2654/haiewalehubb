const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const Room = require("../models/Room");
const User = require("../models/User");
const Service = require("../models/Service");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const { appointmentConfirmationTemplate } = require("../utils/emailTemplates");
// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RP_KEY_ID,
  key_secret: process.env.RP_KEY_SECRET,
});
// Helper function to generate appointment ID
const generateAppointmentId = async () => {
  const count = await Appointment.countDocuments();
  return `APP${(count + 1).toString().padStart(6, "0")}`;
};

// Helper function to find or create customer user (IMPROVED VERSION)
const findOrCreateCustomer = async (customerDetails, session) => {
  try {
    // Try to find existing user by phone (primary) or email
    let customerUser = await User.findOne({
      $or: [
        { phone: customerDetails.phone },
        { email: customerDetails.email?.toLowerCase() },
      ],
    }).session(session);

    // If user doesn't exist, create a new customer user
    if (!customerUser) {
      console.log("🔍 Creating new customer user:", customerDetails);

      // Generate unique email if not provided
      const customerEmail =
        customerDetails.email?.toLowerCase() ||
        `${customerDetails.phone}@customer.temp`;

      customerUser = new User({
        name: customerDetails.name,
        email: customerEmail,
        phone: customerDetails.phone,
        password:
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8), // Strong random password
        role: "user",
        isEmailVerified: !!customerDetails.email, // Auto-verify if email provided
      });

      await customerUser.save({ session });
      console.log("✅ New customer user created:", customerUser._id);
    } else {
      console.log("✅ Existing customer user found:", customerUser._id);
    }

    return customerUser;
  } catch (error) {
    console.error("❌ Error in findOrCreateCustomer:", error);
    throw error;
  }
};

// Modified autoAssign function with simplified employee availability check
exports.autoAssign = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log("User not authenticated or user ID missing");
      await session.abortTransaction();
      return res.status(401).json({ message: "User not authenticated" });
    }

    const {
      serviceId,
      type, // Room type (optional for non-massage)
      appointmentDateTime,
      durationMinutes,
      paymentMethod,
      price,
      roomPrice,
      totalPrice,
      customerDetails,
    } = req.body;

    let userId;

    // Determine the user for the appointment
    if (
      (req.user.employeeRole === "receptionist" ||
        req.user.role === "admin" ||
        req.user.employeeRole === "manager") &&
      customerDetails
    ) {
      // Receptionist/Admin/Manager is booking for a customer
      console.log("🔍 Backend: Admin booking for customer:", customerDetails);

      if (!customerDetails.name || !customerDetails.phone) {
        await session.abortTransaction();
        return res.status(400).json({
          message:
            "Customer name and phone are required for receptionist/admin bookings",
        });
      }

      // Find or create customer user
      const customerUser = await findOrCreateCustomer(customerDetails, session);
      userId = customerUser._id;
      console.log("🔍 Backend: Using customer user ID:", userId);
    } else {
      // Regular user booking for themselves
      userId = req.user._id;
      console.log("🔍 Backend: Using logged-in user ID:", userId);
    }

    // Validate inputs
    if (!serviceId || !appointmentDateTime) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get service details including category
    const service = await Service.findById(serviceId)
      .populate("category")
      .session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Service not found" });
    }

    // Calculate time slots
    const start = new Date(appointmentDateTime);
    const duration =
      durationMinutes || service.pricing[0].durationMinutes || 60;
    const end = new Date(start.getTime() + duration * 60000);

    // Check if datetime is in past
    if (start < new Date()) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Cannot book appointments in the past" });
    }

    // === NEW LOGIC: Check if service requires room ===
    const requiresRoom = service.category.name.toLowerCase() === "massage";

    let selectedRoom = null;
    let finalRoomPrice = roomPrice || 0;
    let finalRoomType = type || "Silver";

    if (requiresRoom) {
      // For massage services - room is required
      if (!type) {
        await session.abortTransaction();
        return res.status(400).json({
          message: "Room type is required for massage services",
        });
      }

      // Find available rooms for massage services (WITH BRANCH DETAILS)
      const availableRooms = await Room.aggregate(
        [
          {
            $match: {
              type: type,
              status: "Available",
            },
          },
          {
            $lookup: {
              from: "branches", // ✅ BRANCH TABLE SE JOIN
              localField: "branch",
              foreignField: "_id",
              as: "branchDetails",
            },
          },
          {
            $unwind: "$branchDetails", // ✅ BRANCH DETAILS UNWIND
          },
          {
            $lookup: {
              from: "availabilities",
              let: { roomId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$roomId", "$$roomId"] },
                        { $eq: ["$status", "Booked"] },
                        {
                          $or: [
                            {
                              $and: [
                                { $lt: ["$startDateTime", end] },
                                { $gt: ["$endDateTime", start] },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: "conflicts",
            },
          },
          {
            $match: {
              "conflicts.0": { $exists: false },
            },
          },
        ],
        { session }
      );
      if (availableRooms.length === 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ message: "No available rooms for selected time" });
      }

      selectedRoom = availableRooms[0];
      finalRoomType = type;

      // Use room's price if roomPrice not provided
      if (!roomPrice && selectedRoom.price) {
        finalRoomPrice = selectedRoom.price;
      }
    } else {
      // For non-massage services - no room required
      selectedRoom = null;
      finalRoomType = "Silver";
      finalRoomPrice = 0; // No room charge for non-massage services
    }

    // 2. Find available service staff based on location and role
    // 2. Find available service staff based on BRANCH and role
    const availableStaff = await User.find({
      role: "employee",
      employeeRole: service.category.assignedEmployeeRole,
      // ✅ Now match with ROOM'S BRANCH NAME
      ...(requiresRoom &&
        selectedRoom && {
          workingLocation: selectedRoom.branchDetails.name, // ✅ CHANGED HERE
        }),
    }).session(session);

    // 3. Create the appointment
    const appointmentId = await generateAppointmentId();
    const appointment = new Appointment({
      appointmentId,
      userId,
      serviceId,
      roomId: selectedRoom ? selectedRoom._id : null, // Only assign roomId if room is selected
      type: finalRoomType,
      appointmentDateTime: start,
      endDateTime: end,
      status: "Pending", // Changed to Pending since no employee assigned yet
      paymentStatus: paymentMethod === "online" ? "Pending" : "Cash",
      servicePrice: price,
      roomPrice: finalRoomPrice,
      totalPrice: totalPrice,
      paymentMethod: paymentMethod,
      createdBy: req.user._id,
    });

    // Create availability record only if room is selected (for massage)
    if (requiresRoom && selectedRoom) {
      const roomAvailability = new Availability({
        roomId: selectedRoom._id,
        startDateTime: start,
        endDateTime: end,
        status: "Booked",
        appointmentId: appointment._id,
      });
      await roomAvailability.save({ session });
    }

    // If payment is online, create Razorpay order
    if (paymentMethod === "online") {
      const options = {
        amount: Math.round(totalPrice * 100), // in paise
        currency: "INR",
        receipt: `appt_${appointmentId}`,
        notes: {
          appointmentId: appointmentId,
          service: service.name,
          userId: userId.toString(),
        },
      };

      const rpOrder = await razorpay.orders.create(options);

      // Store Razorpay order details
      appointment.paymentResult = {
        razorpayOrderId: rpOrder.id,
        status: rpOrder.status,
      };

      await appointment.save({ session });
      await session.commitTransaction();

      // Populate appointment details
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("userId", "name email phone role")
        .populate("createdBy", "name employeeRole role")
        .populate({
          path: "serviceId",
          populate: {
            path: "category",
            select: "name",
          },
        })
        .populate({
          path: "roomId",
          populate: {
            // ✅ ROOM KE SAATH BRANCH POPULATE
            path: "branch",
            select: "name address phone",
          },
        });

      console.log("🔍 Final Appointment - User:", populatedAppointment.userId);
      console.log(
        "🔍 Final Appointment - Created By:",
        populatedAppointment.createdBy
      );

      res.status(201).json({
        message: "Appointment booked successfully.",
        appointment: populatedAppointment,
        availableStaff: availableStaff,
        bookedByReceptionist:
          req.user.employeeRole === "receptionist" ||
          req.user.role === "admin" ||
          req.user.employeeRole === "manager",
        debug: {
          customerUserId: userId,
          bookedByUserId: req.user._id,
          requiresRoom: requiresRoom,
          roomType: finalRoomType,
        },
      });
    } else {
      // For cash payment
      await appointment.save({ session });
      await session.commitTransaction();

      // Populate appointment details
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("userId", "name email phone")
        .populate("createdBy", "name employeeRole")
        .populate({
          path: "serviceId",
          populate: {
            path: "category",
            select: "name",
          },
        })
        .populate({
          path: "roomId",
          populate: {
            // ✅ ROOM KE SAATH BRANCH POPULATE
            path: "branch",
            select: "name address phone",
          },
        });

      res.status(201).json({
        message:
          "Appointment booked successfully. Employee will be assigned manually.",
        appointment: populatedAppointment,
        availableStaff: availableStaff,
        bookedByReceptionist: req.user.employeeRole === "receptionist",
        debug: {
          requiresRoom: requiresRoom,
          roomType: finalRoomType,
        },
      });
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in autoAssign:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
// Add payment verification endpoint
exports.verifyAppointmentPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      appointmentId,
    } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RP_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update appointment payment status
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.paymentStatus = "Paid";
    appointment.paymentResult = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
      status: "paid",
    };

    await appointment.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error in verifyAppointmentPayment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Get availability for a room type
exports.getAvailability = async (req, res) => {
  try {
    const { type, date } = req.query;
    const selectedDate = new Date(date);

    // Get all rooms of this type
    const rooms = await Room.find({ type });
    const roomIds = rooms.map((room) => room._id);

    // Get all bookings for these rooms on this date
    const bookings = await Availability.find({
      roomId: { $in: roomIds },
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
      status: "Booked",
    }).populate("userId", "name employeeId");

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update appointment status (MODIFIED - no need to update staff status)
exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update appointment status only (staff is automatically available now)
    appointment.status = "Completed";
    await appointment.save();

    res.json({ message: "Appointment completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Find appointment and update status
    const appointment = await Appointment.findById(appointmentId)
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing category")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate({
        path: "roomId",
        populate: {
          path: "branch",
          select: "name address phone landline workingHours premium",
        },
      })
      .populate("createdBy", "name employeeRole role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Store old status for comparison
    const oldStatus = appointment.status;

    // Update status
    appointment.status = status;
    await appointment.save();

    // ✅ Check if status changed from Pending to Confirmed
    if (oldStatus === "Pending" && status === "Confirmed") {
      console.log("📧 Sending confirmation email for status change...");

      // Check if it's a massage service
      const service = await Service.findById(appointment.serviceId).populate(
        "category"
      );
      const isMassageService =
        service?.category?.name?.toLowerCase() === "massage";

      // Send confirmation email
      try {
        // Get customer details
        const customerDetails = {
          name: appointment.userId?.name,
          email: appointment.userId?.email,
          phone: appointment.userId?.phone,
        };

        const htmlContent = appointmentConfirmationTemplate(
          appointment,
          customerDetails,
          isMassageService
        );

        await sendEmail({
          email: appointment.userId?.email,
          subject: `✅ Appointment Confirmed - ${appointment.appointmentId} - S.Tatsaya Spa`,
          html: htmlContent,
          name: appointment.userId?.name,
        });

        console.log("✅ Confirmation email sent after status update");
      } catch (emailError) {
        console.error("❌ Error sending confirmation email:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    res.json({
      message: "Status updated successfully",
      appointment,
      emailSent: oldStatus === "Pending" && status === "Confirmed",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentStatus } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { paymentStatus },
      { new: true }
    ).populate("userId employeeId serviceId roomId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Payment status updated successfully", appointment });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// In your appointmentController.js - add this function

// Manual employee assignment with validation
exports.assignEmployeeToAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { appointmentId } = req.params;
    const { employeeId } = req.body;

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate("serviceId")
      .populate({
        path: "roomId",
        populate: {
          // ✅ YEH ADD KARO
          path: "branch",
          select: "name",
        },
      })
      .session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Get employee details
    const employee = await User.findById(employeeId).session(session);
    if (!employee || employee.role !== "employee") {
      await session.abortTransaction();
      return res.status(404).json({ message: "Employee not found" });
    }

    // Validate employee's working location matches room location
    if (employee.workingLocation !== appointment.roomId.branch.name) {
      // ✅ CHANGED
      await session.abortTransaction();
      return res.status(400).json({
        message: `Employee's working location (${employee.workingLocation}) doesn't match room's branch (${appointment.roomId.branch.name})`, // ✅ CHANGED
      });
    }

    // Validate employee role matches service category requirement
    const service = await Service.findById(appointment.serviceId)
      .populate("category")
      .session(session);

    if (employee.employeeRole !== service.category.assignedEmployeeRole) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Employee role (${employee.employeeRole}) doesn't match required role for this service (${service.category.assignedEmployeeRole})`,
      });
    }

    // Check if employee is available at the appointment time
    const conflictingAppointments = await Appointment.find({
      employeeId,
      status: { $in: ["Confirmed", "In Progress"] },
      $or: [
        {
          appointmentDateTime: {
            $lt: appointment.endDateTime,
            $gte: appointment.appointmentDateTime,
          },
        },
        {
          endDateTime: {
            $lte: appointment.endDateTime,
            $gt: appointment.appointmentDateTime,
          },
        },
      ],
    }).session(session);

    if (conflictingAppointments.length > 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Employee is not available at this time" });
    }

    // Update appointment with employee assignment
    appointment.employeeId = employeeId;
    appointment.status = "Confirmed";
    await appointment.save({ session });

    // Create availability record for the employee
    const availability = new Availability({
      userId: employeeId,
      roomId: appointment.roomId,
      startDateTime: appointment.appointmentDateTime,
      endDateTime: appointment.endDateTime,
      status: "Booked",
      appointmentId: appointment._id,
    });

    await availability.save({ session });
    await session.commitTransaction();

    // Return populated appointment
    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("userId", "name email phone")
      .populate("serviceId")
      .populate("employeeId", "name employeeId workingLocation employeeRole")
      .populate("roomId", "roomNumber type location");

    res.json({
      message: "Employee assigned successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error assigning employee:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Appointment controller mein `getAvailableEmployees` function mein debug add karo:

// controllers/appointmentController.js - Line ~685 (getAvailableEmployees function) mein:

exports.getAvailableEmployees = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Get appointment details WITH BRANCH POPULATED
    const appointment = await Appointment.findById(appointmentId)
      .populate("serviceId")
      .populate({
        path: "roomId",
        populate: {
          // ✅ YEH ADD KARO
          path: "branch",
          select: "name",
        },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // console.log("🔍 DEBUG - Employee Assignment:");
    // console.log("✅ Appointment Room:", appointment.roomId);
    // console.log("✅ Room Branch:", appointment.roomId?.branch);
    // console.log("✅ Room Branch Name:", appointment.roomId?.branch?.name);

    // Agar branch populate nahi hua toh manually fetch karo
    let branchName = appointment.roomId?.branch?.name;

    if (!branchName && appointment.roomId?.branch) {
      // Fetch branch details manually
      const branch = await mongoose
        .model("Branch")
        .findById(appointment.roomId.branch);
      branchName = branch?.name;
      console.log("✅ Manually fetched branch:", branchName);
    }

    // Get service category
    const service = await Service.findById(appointment.serviceId).populate(
      "category"
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    console.log(
      "✅ Required Employee Role:",
      service.category.assignedEmployeeRole
    );
    console.log("✅ Looking for branch:", branchName);

    if (!branchName) {
      return res.json({
        availableEmployees: [],
        message: "Room branch information not available",
      });
    }

    // Clean branch name (remove "Branch" if present)
    const cleanBranchName = branchName
      .replace(" Branch", "")
      .replace(" branch", "")
      .trim();

    // Find employees with matching location (case-insensitive)
    const availableEmployees = await User.find({
      role: "employee",
      $expr: {
        $regexMatch: {
          input: { $toLower: "$workingLocation" },
          regex: new RegExp(`^${cleanBranchName.toLowerCase()}`),
        },
      },
      employeeRole: service.category.assignedEmployeeRole,
    }).select("name email employeeId employeeRole workingLocation");

    console.log("✅ Available Employees Found:", availableEmployees.length);
    console.log("✅ Employees:", availableEmployees);

    res.json({ availableEmployees });
  } catch (error) {
    console.error("Error fetching available employees:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// controllers/appointmentController.js - Line ~692
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ appointmentId })
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing category")
      .populate("employeeId", "name employeeId employeeRole workingLocation")
      .populate({
        path: "roomId",
        populate: {
          // ✅ YEH CORRECT KARO
          path: "branch",
          select: "name address phone landline workingHours premium",
        },
      })
      .populate("createdBy", "name email phone employeeRole role")
      .populate({
        path: "serviceId",
        populate: {
          path: "category",
          select: "name",
        },
      });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // console.log("✅ Appointment details - Room:", appointment.roomId);
    // console.log("✅ Appointment details - Branch:", appointment.roomId?.branch);

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Generate PDF and return as base64
exports.generateAppointmentPDF = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ appointmentId })
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing category")
      .populate("employeeId", "name employeeId employeeRole")
      .populate("roomId", "roomNumber type location price")
      .populate("createdBy", "name employeeRole role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // PDF generation logic here (we'll use pdfkit)
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // Collect PDF data as buffer
    let pdfBuffers = [];
    doc.on("data", (chunk) => pdfBuffers.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(pdfBuffers);
      const base64Pdf = pdfBuffer.toString("base64");

      res.json({
        success: true,
        pdfBase64: base64Pdf,
        fileName: `appointment-${appointmentId}.pdf`,
      });
    });

    // PDF Content
    doc.fontSize(20).text("SPA APPOINTMENT RECEIPT", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Appointment ID: ${appointment.appointmentId}`);
    doc.text(`Date: ${appointment.appointmentDateTime.toLocaleDateString()}`);
    doc.text(`Time: ${appointment.appointmentDateTime.toLocaleTimeString()}`);
    doc.moveDown();

    doc.text(`Customer: ${appointment.userId.name}`);
    doc.text(`Phone: ${appointment.userId.phone}`);
    if (appointment.userId.email)
      doc.text(`Email: ${appointment.userId.email}`);
    doc.moveDown();

    doc.text(`Service: ${appointment.serviceId.name}`);
    doc.text(
      `Duration: ${
        appointment.serviceId.pricing[0]?.durationMinutes || 60
      } minutes`
    );
    doc.text(
      `Room: ${appointment.roomId.type} (${appointment.roomId.roomNumber})`
    );
    doc.moveDown();

    doc.text(`Service Price: ₹${appointment.servicePrice}`);
    doc.text(`Room Price: ₹${appointment.roomPrice}`);
    doc.text(`Total Price: ₹${appointment.totalPrice}`, { bold: true });
    doc.moveDown();

    doc.text(`Status: ${appointment.status}`);
    doc.text(`Payment Method: ${appointment.paymentMethod}`);
    doc.text(`Payment Status: ${appointment.paymentStatus}`);

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF generation failed",
      error: error.message,
    });
  }
};
// Direct PDF download route for QR code
// Direct PDF download route for QR code - IMPROVED DESIGN
exports.downloadAppointmentPDF = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({ appointmentId })
      .populate("userId", "name email phone")
      .populate("serviceId", "name description pricing category")
      .populate("employeeId", "name employeeId employeeRole")
      .populate("roomId", "roomNumber type location price")
      .populate("createdBy", "name employeeRole role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Set response headers for direct download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=appointment-${appointmentId}.pdf`
    );

    // Pipe PDF directly to response
    doc.pipe(res);

    // Colors
    const primaryColor = "#9d174d"; // Rose-800
    const secondaryColor = "#fdf2f8"; // Rose-50
    const accentColor = "#f472b6"; // Rose-400
    const textColor = "#374151"; // Gray-700
    const lightTextColor = "#6b7280"; // Gray-500

    // Helper function for sections
    const drawSection = (title, yPosition) => {
      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(title, 50, yPosition);
      doc.moveDown(0.3);
      return doc.y;
    };

    // ===== HEADER =====
    // Background
    doc.rect(0, 0, doc.page.width, 120).fill(secondaryColor);

    // Logo/Title
    doc
      .fillColor(primaryColor)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("S.TATSAYA", 50, 40, { align: "center" });

    doc
      .fillColor(textColor)
      .fontSize(16)
      .font("Helvetica")
      .text("Appointment Receipt", 50, 70, { align: "center" });

    // Appointment ID Badge
    doc.rect(doc.page.width - 180, 30, 130, 25).fill(primaryColor);
    doc
      .fillColor("#ffffff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`ID: ${appointmentId}`, doc.page.width - 175, 38);

    doc.y = 130;

    // ===== APPOINTMENT DETAILS =====
    let currentY = drawSection("APPOINTMENT DETAILS", doc.y);

    // Details in two columns
    const col1X = 50;
    const col2X = 300;

    doc.fillColor(textColor).fontSize(10).font("Helvetica");

    // Column 1
    doc.text(
      `Date: ${appointment.appointmentDateTime.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      col1X,
      currentY
    );

    doc.text(
      `Time: ${appointment.appointmentDateTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`,
      col1X,
      currentY + 15
    );

    // Column 2
    doc.text(`Status:`, col2X, currentY);
    doc
      .fillColor(
        appointment.status === "Confirmed"
          ? "#059669"
          : appointment.status === "Pending"
          ? "#d97706"
          : appointment.status === "Completed"
          ? "#2563eb"
          : "#dc2626"
      )
      .text(appointment.status, col2X + 35, currentY);

    doc.fillColor(textColor).text(`Payment:`, col2X, currentY + 15);
    doc
      .fillColor(
        appointment.paymentStatus === "Paid"
          ? "#059669"
          : appointment.paymentStatus === "Cash"
          ? "#2563eb"
          : "#d97706"
      )
      .text(appointment.paymentStatus, col2X + 45, currentY + 15);

    doc.fillColor(textColor);
    doc.moveDown(1.5);

    // ===== CUSTOMER INFORMATION =====
    currentY = drawSection("CUSTOMER INFORMATION", doc.y);

    doc.fillColor(textColor).fontSize(10);
    doc.text(`Name: ${appointment.userId.name}`, col1X, currentY);
    doc.text(`Phone: ${appointment.userId.phone}`, col1X, currentY + 15);
    if (appointment.userId.email) {
      doc.text(`Email: ${appointment.userId.email}`, col1X, currentY + 30);
      currentY += 45;
    } else {
      currentY += 30;
    }

    doc.moveDown(1);

    // ===== SERVICE DETAILS =====
    currentY = drawSection("SERVICE DETAILS", doc.y);

    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(appointment.serviceId.name, col1X, currentY);

    doc
      .fillColor(textColor)
      .fontSize(9)
      .font("Helvetica")
      .text(appointment.serviceId.description, col1X, currentY + 15, {
        width: 450,
        align: "justify",
      });

    const serviceDescHeight = doc.heightOfString(
      appointment.serviceId.description,
      { width: 450 }
    );
    doc.text(
      `Duration: ${
        appointment.serviceId.pricing[0]?.durationMinutes || 60
      } minutes`,
      col1X,
      currentY + serviceDescHeight + 25
    );

    doc.y = currentY + serviceDescHeight + 45;
    doc.moveDown(0.5);

    // ===== ROOM DETAILS =====
    currentY = drawSection("ROOM DETAILS", doc.y);

    doc.fillColor(textColor).fontSize(10);
    doc.text(`Room Type: ${appointment.roomId.type}`, col1X, currentY);
    doc.text(
      `Room Number: ${appointment.roomId.roomNumber}`,
      col1X,
      currentY + 15
    );
    doc.text(`Location: ${appointment.roomId.location}`, col1X, currentY + 30);

    doc.y = currentY + 50;
    doc.moveDown(0.5);

    // ===== PAYMENT SUMMARY =====
    currentY = drawSection("PAYMENT SUMMARY", doc.y);

    // Payment method
    doc
      .fillColor(textColor)
      .fontSize(10)
      .text(
        `Payment Method: ${appointment.paymentMethod.toUpperCase()}`,
        col1X,
        currentY
      );

    // Price breakdown with background
    const priceBoxY = currentY + 25;
    doc
      .rect(col1X, priceBoxY, 200, 80)
      .fill(secondaryColor)
      .stroke(accentColor);

    // Service Price
    doc
      .fillColor(textColor)
      .fontSize(10)
      .text("Service Price:", col1X + 10, priceBoxY + 15);
    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`₹${appointment.servicePrice}`, col1X + 150, priceBoxY + 15);

    // Room Price
    doc
      .fillColor(textColor)
      .fontSize(10)
      .text("Room Price:", col1X + 10, priceBoxY + 35);
    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`₹${appointment.roomPrice}`, col1X + 150, priceBoxY + 35);

    // Total Price
    doc.rect(col1X + 10, priceBoxY + 55, 180, 2).fill(accentColor);
    doc
      .fillColor(textColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Total Amount:", col1X + 10, priceBoxY + 65);
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`₹${appointment.totalPrice}`, col1X + 150, priceBoxY + 65);

    doc.y = priceBoxY + 95;
    doc.moveDown(1);

    // ===== ADDITIONAL INFORMATION =====
    currentY = drawSection("ADDITIONAL INFORMATION", doc.y);

    doc.fillColor(textColor).fontSize(9);
    const instructions = [
      "• Please arrive 15 minutes before your scheduled appointment",
      "• Bring this receipt for verification",
      "• Cancellation policy: 2 hours prior notice required",
      "• For rescheduling, contact us at least 1 hour in advance",
    ];

    instructions.forEach((instruction, index) => {
      doc.text(instruction, col1X, currentY + index * 12);
    });

    doc.y = currentY + instructions.length * 12 + 20;

    // ===== FOOTER =====
    const footerY = doc.page.height - 80;

    // Separator line
    doc
      .moveTo(50, footerY - 20)
      .lineTo(doc.page.width - 50, footerY - 20)
      .strokeColor(lightTextColor)
      .lineWidth(0.5)
      .stroke();

    // Contact information
    doc.fillColor(lightTextColor).fontSize(8);
    doc.text("Thank you for choosing our spa services!", 50, footerY - 10, {
      align: "center",
    });
    doc.text(
      "📍 123 Wellness Street, Spa City | 📞 +91-9876543210 | ✉️ info@spawellness.com",
      50,
      footerY,
      { align: "center" }
    );
    doc.text(
      `Generated on: ${new Date().toLocaleDateString(
        "en-IN"
      )} at ${new Date().toLocaleTimeString("en-IN")}`,
      50,
      footerY + 10,
      { align: "center" }
    );

    // Page number
    doc.text(`Page 1 of 1`, 50, footerY + 20, { align: "center" });

    // ===== SECURITY FEATURES =====
    // Watermark

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF generation failed",
    });
  }
};
const sendAppointmentConfirmationEmail = async (
  appointment,
  customerDetails,
  isMassageService
) => {
  try {
    // Get customer email
    const customerEmail = customerDetails?.email || appointment.userId?.email;

    if (!customerEmail) {
      console.log("⚠️ No email found for customer, skipping email");
      return;
    }

    // ✅ ONLY SEND EMAIL IF APPOINTMENT IS CONFIRMED
    if (appointment.status !== "Confirmed") {
      console.log(
        "⏸️ Appointment not confirmed yet, email will be sent when status changes to Confirmed"
      );
      return;
    }

    const subject = `✅ Appointment Confirmed - ${appointment.appointmentId} - S.Tatsaya Spa`;

    const htmlContent = appointmentConfirmationTemplate(
      appointment,
      customerDetails,
      isMassageService
    );

    await sendEmail({
      email: customerEmail,
      subject: subject,
      html: htmlContent,
      name: customerDetails?.name || appointment.userId?.name,
    });

    console.log("✅ Appointment confirmation email sent to:", customerEmail);
  } catch (error) {
    console.error("❌ Error sending appointment confirmation email:", error);
    // Don't throw error, just log it
  }
};
