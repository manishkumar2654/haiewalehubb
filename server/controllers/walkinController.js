const mongoose = require("mongoose");
const Walkin = require("../models/Walkin");
const Service = require("../models/Service");
const Product = require("../models/Product");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const Branch = require("../models/Branch");
const Category = require("../models/Category");

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const dir = path.join(__dirname, "../uploads/walkins");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// ================================================
// 🆕 NEW FUNCTION: Add Services to Existing Walkin
// ================================================
exports.addServicesToWalkin = async (req, res) => {
  try {
    const { services } = req.body;
    const walkinId = req.params.id;

    console.log(`Adding services to walkin: ${walkinId}`);
    console.log("Services data:", services);

    // Find the walkin
    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    if (!services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No services provided",
      });
    }

    let newServices = [];
    let servicesTotal = 0;

    // Process each new service
    for (const serviceItem of services) {
      try {
        const service = await Service.findById(serviceItem.serviceId).populate(
          "category"
        );

        if (!service) {
          return res.status(400).json({
            success: false,
            message: `Service ${serviceItem.serviceId} not found`,
          });
        }

        const pricing = service.pricing.find(
          (p) => p._id.toString() === serviceItem.pricingId
        );

        if (!pricing) {
          return res.status(400).json({
            success: false,
            message: `Pricing option not found for service ${service.name}`,
          });
        }

        newServices.push({
          category: service.category?._id || null,
          service: service._id,
          pricing: pricing._id,
          duration: pricing.durationMinutes,
          price: pricing.price,
          staff: serviceItem.staffId || null,
        });

        servicesTotal += pricing.price;

        console.log(`Added service: ${service.name} - ₹${pricing.price}`);
      } catch (error) {
        console.error("Error processing service:", error);
        return res.status(400).json({
          success: false,
          message: `Invalid service data: ${error.message}`,
        });
      }
    }

    // Add new services to existing walkin
    walkin.services.push(...newServices);

    // Recalculate totals
    walkin.subtotal += servicesTotal;
    walkin.totalAmount = walkin.subtotal - walkin.discount;
    walkin.dueAmount = walkin.totalAmount - walkin.amountPaid;

    // Update payment status if needed
    if (walkin.dueAmount > 0) {
      walkin.paymentStatus = "partially_paid";
    } else {
      walkin.paymentStatus = "paid";
    }

    walkin.updatedBy = req.user?._id || null;

    await walkin.save();

    // Regenerate PDF and QR code
    try {
      const { pdfPath, qrCodeData } = await generateWalkinAssets(walkin);
      walkin.pdfUrl = `/uploads/walkins/${path.basename(pdfPath)}`;
      walkin.qrCode = qrCodeData;
      await walkin.save();
    } catch (assetError) {
      console.error("Error regenerating assets:", assetError);
      // Continue even if assets generation fails
    }

    // Get updated walkin with populated data
    const updatedWalkin = await Walkin.findById(walkinId)
      .populate("services.service services.category")
      .populate("services.staff", "name employeeId");

    res.json({
      success: true,
      message: `${newServices.length} service(s) added successfully`,
      data: updatedWalkin,
      addedServices: newServices.length,
      addedAmount: servicesTotal,
    });
  } catch (error) {
    console.error("Error adding services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add services: " + error.message,
    });
  }
};

// ================================================
// 🆕 NEW FUNCTION: Add Products to Existing Walkin
// ================================================
exports.addProductsToWalkin = async (req, res) => {
  try {
    const { products } = req.body;
    const walkinId = req.params.id;

    console.log(`Adding products to walkin: ${walkinId}`);
    console.log("Products data:", products);

    // Find the walkin
    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided",
      });
    }

    let newProducts = [];
    let productsTotal = 0;

    // Process each new product
    for (const productItem of products) {
      try {
        const product = await Product.findById(productItem.productId);

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${productItem.productId} not found`,
          });
        }

        const quantity = productItem.quantity || 1;

        // ✅ Check available stock
        const availableStock = product.totalStock - (product.inUseStock || 0);

        console.log(`Product: ${product.name}`);
        console.log(`Total Stock: ${product.totalStock}`);
        console.log(`In Use Stock: ${product.inUseStock || 0}`);
        console.log(`Available Stock: ${availableStock}`);
        console.log(`Requested Quantity: ${quantity}`);

        if (availableStock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient available stock for ${product.name}. Available: ${availableStock}, Requested: ${quantity}`,
          });
        }

        const productTotal = product.price * quantity;

        // Create product data with stock tracking
        newProducts.push({
          product: product._id,
          quantity: quantity,
          price: product.price,
          total: productTotal,
          stockDeducted: false, // Initially not deducted
          availableStockAtBooking: availableStock, // Store for reference
        });

        productsTotal += productTotal;

        console.log(
          `Added product: ${product.name} x${quantity} - ₹${productTotal}`
        );
      } catch (error) {
        console.error("Error processing product:", error);
        return res.status(400).json({
          success: false,
          message: `Invalid product data: ${error.message}`,
        });
      }
    }

    // Add new products to existing walkin
    walkin.products.push(...newProducts);

    // Recalculate totals
    walkin.subtotal += productsTotal;
    walkin.totalAmount = walkin.subtotal - walkin.discount;
    walkin.dueAmount = walkin.totalAmount - walkin.amountPaid;

    // Update payment status if needed
    if (walkin.dueAmount > 0) {
      walkin.paymentStatus = "partially_paid";
    } else {
      walkin.paymentStatus = "paid";
    }

    walkin.updatedBy = req.user?._id || null;

    await walkin.save();

    // 🔥 If walkin is confirmed/paid, deduct stock immediately
    if (walkin.status === "confirmed" || walkin.status === "completed") {
      for (const productItem of newProducts) {
        const product = await Product.findById(productItem.product);
        if (product) {
          // ✅ DIRECTLY DEDUCT FROM TOTAL STOCK
          product.totalStock = product.totalStock - productItem.quantity;
          await product.save();

          // Update productItem in walkin to mark as deducted
          const productIndex = walkin.products.findIndex(
            (p) => p.product.toString() === productItem.product.toString()
          );
          if (productIndex !== -1) {
            walkin.products[productIndex].stockDeducted = true;
          }
        }
      }
      await walkin.save();
    }

    // Regenerate PDF and QR code
    try {
      const { pdfPath, qrCodeData } = await generateWalkinAssets(walkin);
      walkin.pdfUrl = `/uploads/walkins/${path.basename(pdfPath)}`;
      walkin.qrCode = qrCodeData;
      await walkin.save();
    } catch (assetError) {
      console.error("Error regenerating assets:", assetError);
      // Continue even if assets generation fails
    }

    // Get updated walkin with populated data
    const updatedWalkin = await Walkin.findById(walkinId).populate(
      "products.product"
    );

    res.json({
      success: true,
      message: `${newProducts.length} product(s) added successfully`,
      data: updatedWalkin,
      addedProducts: newProducts.length,
      addedAmount: productsTotal,
      stockDeducted:
        walkin.status === "confirmed" || walkin.status === "completed",
    });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add products: " + error.message,
    });
  }
};

// ================================================
// 🆕 NEW FUNCTION: Update Walkin Status
// ================================================
exports.updateWalkinStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const walkinId = req.params.id;

    console.log(`Updating status for walkin: ${walkinId} to ${status}`);

    // Find the walkin
    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    // Validate status
    const validStatuses = [
      "draft",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const previousStatus = walkin.status;
    const previousPaymentStatus = walkin.paymentStatus;

    // Update status
    walkin.status = status;
    walkin.updatedBy = req.user?._id || null;

    // If status changed to confirmed/completed, check payment and deduct stock
    if (
      (status === "confirmed" || status === "completed") &&
      (previousStatus === "draft" || previousStatus === "cancelled")
    ) {
      // If payment is made, mark as paid
      if (walkin.amountPaid > 0) {
        if (walkin.amountPaid >= walkin.totalAmount) {
          walkin.paymentStatus = "paid";
        } else {
          walkin.paymentStatus = "partially_paid";
        }
      }

      // 🔥 Deduct stock for all products that haven't been deducted
      await deductStockForWalkin(walkinId);
    }

    // If status changed to cancelled, release stock
    if (
      status === "cancelled" &&
      (previousStatus === "confirmed" ||
        previousStatus === "in_progress" ||
        previousStatus === "completed")
    ) {
      walkin.paymentStatus = "pending";

      // 🔥 Release stock for all products that were deducted
      await releaseStockForWalkin(walkinId);
    }

    await walkin.save();

    // Regenerate PDF and QR code if status changed significantly
    if (status === "completed" || previousStatus === "completed") {
      try {
        const { pdfPath, qrCodeData } = await generateWalkinAssets(walkin);
        walkin.pdfUrl = `/uploads/walkins/${path.basename(pdfPath)}`;
        walkin.qrCode = qrCodeData;
        await walkin.save();
      } catch (assetError) {
        console.error("Error regenerating assets:", assetError);
      }
    }

    // Get updated walkin with populated data
    const updatedWalkin = await Walkin.findById(walkinId)
      .populate("services.service products.product")
      .populate("services.staff", "name employeeId");

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updatedWalkin,
      previousStatus: previousStatus,
      stockAdjusted:
        status === "cancelled" ||
        status === "confirmed" ||
        status === "completed",
    });
  } catch (error) {
    console.error("Error updating walkin status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status: " + error.message,
    });
  }
};

// ================================================
// 🆕 NEW HELPER: Deduct Stock for Walkin
// ================================================
async function deductStockForWalkin(walkinId) {
  try {
    console.log(`🔄 Deducting stock for walkin: ${walkinId}`);

    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      throw new Error("Walkin not found");
    }

    // Check if walkin is in a state that requires stock deduction
    if (!["confirmed", "in_progress", "completed"].includes(walkin.status)) {
      console.log(`❌ Walkin status is ${walkin.status}, not deducting stock`);
      return;
    }

    // Process each product in the walkin
    for (const productItem of walkin.products) {
      // Skip if stock already deducted
      if (productItem.stockDeducted) {
        console.log(
          `⏭️ Stock already deducted for product: ${productItem.product}`
        );
        continue;
      }

      const product = await Product.findById(productItem.product);

      if (!product) {
        console.error(`❌ Product not found: ${productItem.product}`);
        continue;
      }

      // ✅ DIRECT MINUS FROM TOTAL STOCK
      if (product.totalStock < productItem.quantity) {
        console.error(
          `❌ Insufficient stock for ${product.name}. Available: ${product.availableStock}, Required: ${productItem.quantity}`
        );
        productItem.stockDeducted = false;
        productItem.deductionError = "Insufficient stock";
        continue;
      }

      // REDUCE TOTAL STOCK DIRECTLY
      product.totalStock = product.totalStock - productItem.quantity;

      await product.save();

      // Mark as deducted in walkin
      productItem.stockDeducted = true;
      productItem.deductionError = null;

      console.log(
        `✅ DIRECTLY deducted ${productItem.quantity} units from ${product.name}`
      );
      console.log(
        `   Old Total Stock: ${product.totalStock + productItem.quantity}`
      );
      console.log(`   New Total Stock: ${product.totalStock}`);
      console.log(`   In Use Stock (NO CHANGE): ${product.inUseStock || 0}`);
      console.log(`   Available Stock Now: ${product.availableStock}`);
    }

    await walkin.save();
    console.log(
      `✅ Stock deduction completed for walkin: ${walkin.walkinNumber}`
    );
  } catch (error) {
    console.error("❌ Error deducting stock:", error);
    throw error;
  }
}

// ================================================
// 🆕 NEW HELPER: Release Stock for Walkin
// ================================================
async function releaseStockForWalkin(walkinId) {
  try {
    console.log(`🔄 Releasing stock for walkin: ${walkinId}`);

    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      throw new Error("Walkin not found");
    }

    // Process each product in the walkin
    for (const productItem of walkin.products) {
      // Skip if stock was never deducted
      if (!productItem.stockDeducted) {
        console.log(
          `⏭️ Stock not deducted for product: ${productItem.product}, skipping release`
        );
        continue;
      }

      const product = await Product.findById(productItem.product);

      if (!product) {
        console.error(`❌ Product not found: ${productItem.product}`);
        continue;
      }

      // ✅ ADD BACK TO TOTAL STOCK
      product.totalStock = product.totalStock + productItem.quantity;

      await product.save();

      // Mark as released in walkin
      productItem.stockDeducted = false;
      productItem.releasedAt = new Date();

      console.log(
        `✅ DIRECTLY added back ${productItem.quantity} units to ${product.name}`
      );
      console.log(
        `   Old Total Stock: ${product.totalStock - productItem.quantity}`
      );
      console.log(`   New Total Stock: ${product.totalStock}`);
      console.log(`   In Use Stock (NO CHANGE): ${product.inUseStock || 0}`);
      console.log(`   Available Stock Now: ${product.availableStock}`);
    }

    await walkin.save();
    console.log(
      `✅ Stock release completed for walkin: ${walkin.walkinNumber}`
    );
  } catch (error) {
    console.error("❌ Error releasing stock:", error);
    throw error;
  }
}

// ================================================
// 🆕 NEW FUNCTION: Update Walkin Payment
// ================================================
exports.updateWalkinPayment = async (req, res) => {
  try {
    const { amountPaid, paymentMethod } = req.body;
    const walkinId = req.params.id;

    console.log(`Updating payment for walkin: ${walkinId}`);
    console.log("Payment data:", { amountPaid, paymentMethod });

    const walkin = await Walkin.findById(walkinId);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    const previousAmountPaid = walkin.amountPaid || 0;
    const previousStatus = walkin.status;

    walkin.amountPaid = amountPaid || walkin.amountPaid;
    walkin.paymentMethod = paymentMethod || walkin.paymentMethod;
    walkin.dueAmount = walkin.totalAmount - walkin.amountPaid;

    // Update payment status
    if (walkin.dueAmount > 0) {
      walkin.paymentStatus = "partially_paid";
      walkin.status = "confirmed";
    } else {
      walkin.paymentStatus = "paid";
      walkin.status = "confirmed";
    }

    walkin.updatedBy = req.user?._id || null;

    await walkin.save();

    // 🔥 IMPORTANT: If payment is made (even partial), deduct stock
    if (
      walkin.amountPaid > previousAmountPaid &&
      walkin.status === "confirmed"
    ) {
      await deductStockForWalkin(walkinId);
    }

    res.json({
      success: true,
      message: "Payment updated successfully",
      data: walkin,
      stockDeducted: walkin.status === "confirmed",
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment: " + error.message,
    });
  }
};

// ================================================
// EXISTING FUNCTIONS (kept for reference)
// ================================================

// Create new walkin
exports.createWalkin = async (req, res) => {
  try {
    console.log("🎫 CREATE WALKIN REQUEST");

    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      branch,
      services = [],
      products = [],
      seats = [],
      discount = 0,
      paymentMethod = "cash",
      amountPaid = 0,
      calculatedTotals, // Client se pre-calculated totals aaenge
    } = req.body;

    // ✅ BASIC VALIDATION
    if (!customerName?.trim() || !customerPhone?.trim() || !branch) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone and branch are required",
      });
    }

    // ✅ USE PRE-CALCULATED TOTALS (Client side calculation)
    const totals = calculatedTotals || {
      subtotal: 0,
      totalAmount: 0,
      dueAmount: 0,
    };

    // ✅ PREPARE SIMPLE DATA
    const servicesData = services.map((service) => ({
      service: service.serviceId,
      pricing: service.pricingId || new mongoose.Types.ObjectId(),
      price: service.price || 0,
      duration: service.duration || 30,
      staff: service.staffId || null,
    }));

    const productsData = products.map((product) => ({
      product: product.productId,
      quantity: product.quantity || 1,
      price: product.price || 0,
      total: (product.price || 0) * (product.quantity || 1),
      stockDeducted: false,
    }));

    const seatsData = seats.map((seat) => ({
      seat: seat.seatId,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      duration: seat.duration || 1,
      price: seat.price || 0,
      total: seat.total || 0,
      bookedAt: new Date(),
    }));

    // ✅ DETERMINE STATUS
    let paymentStatus = "pending";
    let status = "draft";

    if (amountPaid > 0) {
      if (totals.dueAmount > 0) {
        paymentStatus = "partially_paid";
        status = "confirmed";
      } else {
        paymentStatus = "paid";
        status = "confirmed";
      }
    }

    // ✅ CREATE WALKIN
    const walkinData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: (customerEmail || "").trim(),
      customerAddress: (customerAddress || "").trim(),
      notes: (notes || "").trim(),
      branch,
      services: servicesData,
      products: productsData,
      seats: seatsData,
      subtotal: totals.subtotal || 0,
      discount: Number(discount) || 0,
      totalAmount: totals.totalAmount || 0,
      paymentMethod,
      amountPaid: Number(amountPaid) || 0,
      dueAmount: totals.dueAmount || 0,
      paymentStatus,
      status,
      createdBy: req.user?._id || null,
    };

    console.log("📝 Saving walkin to database...");
    const walkin = await Walkin.create(walkinData);
    console.log("✅ Walkin saved:", walkin.walkinNumber);

    // ✅ IMMEDIATE RESPONSE (NO WAITING FOR PDF/QR)
    res.status(201).json({
      success: true,
      message: "Walkin created successfully!",
      data: {
        _id: walkin._id,
        walkinNumber: walkin.walkinNumber,
        invoiceNumber: walkin.invoiceNumber,
        customerName: walkin.customerName,
        totalAmount: walkin.totalAmount,
        status: walkin.status,
        paymentStatus: walkin.paymentStatus,
        createdAt: walkin.createdAt,
      },
      actions: {
        downloadPDF: `/api/v1/walkins/${walkin._id}/pdf`,
        viewDetails: `/admin/walkins/${walkin._id}`,
      },
    });

    // ✅ BACKGROUND TASKS (AFTER RESPONSE)
    setTimeout(async () => {
      try {
        console.log("🔄 Starting background tasks...");

        // 1. Deduct stock if paid
        if (amountPaid > 0 && walkin.status === "confirmed") {
          await deductStock(walkin._id);
        }

        // 2. Book seats
        if (seatsData.length > 0) {
          await bookSeats(walkin._id);
        }

        // 3. Generate PDF (optional)
        await generatePDF(walkin);

        console.log("✅ All background tasks completed");
      } catch (bgError) {
        console.error("❌ Background task error:", bgError);
      }
    }, 1000);
  } catch (error) {
    console.error("❌ CREATE WALKIN ERROR:", error);

    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Walkin number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create walkin",
    });
  }
};

// ================================================
// 🔧 HELPER FUNCTIONS
// ================================================

async function deductStock(walkinId) {
  try {
    const walkin = await Walkin.findById(walkinId);
    if (!walkin) return;

    const Product = require("../models/Product");

    for (const productItem of walkin.products) {
      const product = await Product.findById(productItem.product);
      if (product && product.totalStock >= productItem.quantity) {
        product.totalStock -= productItem.quantity;
        await product.save();
        productItem.stockDeducted = true;
      }
    }

    await walkin.save();
    console.log("✅ Stock deducted");
  } catch (error) {
    console.error("Stock deduction error:", error);
  }
}

async function bookSeats(walkinId) {
  try {
    const walkin = await Walkin.findById(walkinId);
    if (!walkin) return;

    const Seat = require("../models/Seat");

    for (const seatItem of walkin.seats) {
      const seat = await Seat.findById(seatItem.seat);
      if (seat) {
        seat.status = "Booked";
        seat.lastBooked = new Date();
        await seat.save();
      }
    }

    console.log("✅ Seats booked");
  } catch (error) {
    console.error("Seat booking error:", error);
  }
}

// Get all walkins
exports.getAllWalkins = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      status,
      branch,
      customerPhone,
      customerName,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.walkinDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.walkinDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.walkinDate.$lte = end;
      }
    }

    if (status) filter.status = status;
    if (branch) filter.branch = branch;
    if (customerPhone)
      filter.customerPhone = { $regex: customerPhone, $options: "i" };
    if (customerName)
      filter.customerName = { $regex: customerName, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [walkins, total] = await Promise.all([
      Walkin.find(filter)
        .populate(
          "services.service services.category products.product createdBy"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Walkin.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: walkins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching walkins:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single walkin
exports.getWalkin = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.id)
      .populate(
        "services.service services.category products.product createdBy updatedBy"
      )
      .populate("services.staff", "name employeeId employeeRole");

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    res.json({
      success: true,
      data: walkin,
    });
  } catch (error) {
    console.error("Error fetching walkin:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update walkin (general update)
exports.updateWalkin = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.id);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    const previousStatus = walkin.status;

    // Update basic info
    if (req.body.customerName) walkin.customerName = req.body.customerName;
    if (req.body.customerPhone) walkin.customerPhone = req.body.customerPhone;
    if (req.body.customerEmail) walkin.customerEmail = req.body.customerEmail;
    if (req.body.customerAddress)
      walkin.customerAddress = req.body.customerAddress;
    if (req.body.notes) walkin.notes = req.body.notes;
    if (req.body.branch) walkin.branch = req.body.branch;
    if (req.body.paymentMethod) walkin.paymentMethod = req.body.paymentMethod;
    if (req.body.amountPaid !== undefined)
      walkin.amountPaid = req.body.amountPaid;

    if (req.body.status) {
      walkin.status = req.body.status;
    }

    walkin.updatedBy = req.user?._id || null;

    // Recalculate totals
    let servicesTotal = 0;
    walkin.services.forEach((service) => {
      servicesTotal += service.price || 0;
    });

    let productsTotal = 0;
    walkin.products.forEach((product) => {
      productsTotal += product.total || 0;
    });

    walkin.subtotal = servicesTotal + productsTotal;
    walkin.totalAmount = walkin.subtotal - (walkin.discount || 0);
    walkin.dueAmount = walkin.totalAmount - (walkin.amountPaid || 0);

    if (walkin.dueAmount > 0) {
      walkin.paymentStatus = "partially_paid";
    } else {
      walkin.paymentStatus = "paid";
    }

    await walkin.save();

    // Handle stock based on status change
    if (previousStatus !== walkin.status) {
      if (walkin.status === "cancelled" && previousStatus !== "cancelled") {
        await releaseStockForWalkin(walkin._id);
      } else if (
        (walkin.status === "confirmed" || walkin.status === "completed") &&
        previousStatus === "draft"
      ) {
        await deductStockForWalkin(walkin._id);
      }
    }

    const updatedWalkin = await Walkin.findById(walkin._id)
      .populate("services.service services.category products.product")
      .populate("services.staff", "name employeeId");

    res.json({
      success: true,
      message: "Walkin updated successfully",
      data: updatedWalkin,
      stockAdjusted: previousStatus !== walkin.status,
    });
  } catch (error) {
    console.error("Error updating walkin:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate PDF
exports.generatePDF = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.id).populate(
      "services.service services.category products.product"
    );

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${walkin.walkinNumber}.pdf`
    );

    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text("LUXURY SPA & SALON", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("WALK-IN INVOICE", { align: "center" });
    doc.moveDown(1);

    doc.fontSize(10);
    doc.text(`Invoice No: ${walkin.invoiceNumber}`, { continued: true });
    doc.text(`Walk-in No: ${walkin.walkinNumber}`, { align: "right" });
    doc.text(`Date: ${new Date(walkin.walkinDate).toLocaleDateString()}`);
    doc.text(`Branch: ${walkin.branch}`);
    doc.moveDown(1);

    doc.fontSize(12).text("Customer Details:", { underline: true });
    doc.fontSize(10);
    doc.text(`Name: ${walkin.customerName}`);
    doc.text(`Phone: ${walkin.customerPhone}`);
    if (walkin.customerEmail) doc.text(`Email: ${walkin.customerEmail}`);
    if (walkin.customerAddress) doc.text(`Address: ${walkin.customerAddress}`);
    doc.moveDown(1);

    // Services Table
    if (walkin.services.length > 0) {
      doc.fontSize(12).text("Services:", { underline: true });
      doc.moveDown(0.5);

      walkin.services.forEach((service, index) => {
        doc.text(`${index + 1}. ${service.service?.name || "Service"}`);
        doc.text(`   Duration: ${service.duration || 0} mins`);
        doc.text(`   Price: ₹${service.price || 0}`);
        doc.moveDown(0.5);
      });
    }

    // Products Table
    if (walkin.products.length > 0) {
      doc.fontSize(12).text("Products:", { underline: true });
      doc.moveDown(0.5);

      walkin.products.forEach((product, index) => {
        doc.text(`${index + 1}. ${product.product?.name || "Product"}`);
        doc.text(`   Quantity: ${product.quantity}`);
        doc.text(`   Price: ₹${product.price || 0} each`);
        doc.text(`   Total: ₹${product.total || 0}`);
        doc.moveDown(0.5);
      });
    }

    // Summary
    doc.fontSize(12).text("Summary:", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    doc.text(`Subtotal: ₹${walkin.subtotal.toFixed(2)}`);
    doc.text(`Discount: ₹${walkin.discount.toFixed(2)}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold");
    doc.text(`Total Amount: ₹${walkin.totalAmount.toFixed(2)}`);
    doc.text(`Amount Paid: ₹${walkin.amountPaid.toFixed(2)}`);
    doc.text(`Due Amount: ₹${walkin.dueAmount.toFixed(2)}`);
    doc.moveDown(1);

    // Payment Status
    doc.fontSize(11);
    doc.text(`Payment Status: ${walkin.paymentStatus.toUpperCase()}`, {
      align: "center",
    });
    doc.text(`Payment Method: ${walkin.paymentMethod || "Cash"}`, {
      align: "center",
    });
    doc.moveDown(2);

    // Footer
    doc.fontSize(8);
    doc.text("Thank you for choosing Luxury SPA & Salon!", { align: "center" });
    doc.text("For any queries, contact: 9713326656", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Generate QR code
exports.generateQR = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.id);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    const qrData = {
      walkinId: walkin._id,
      walkinNumber: walkin.walkinNumber,
      totalAmount: walkin.totalAmount,
      customerName: walkin.customerName,
      timestamp: new Date().toISOString(),
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        walkinData: qrData,
      },
    });
  } catch (error) {
    console.error("Error generating QR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete walkin
exports.deleteWalkin = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.id);

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    // Soft delete - mark as cancelled
    walkin.status = "cancelled";
    walkin.updatedBy = req.user?._id || null;
    await walkin.save();

    // Release stock when walkin is cancelled
    await releaseStockForWalkin(walkin._id);

    res.json({
      success: true,
      message: "Walkin cancelled successfully",
      stockReleased: true,
    });
  } catch (error) {
    console.error("Error deleting walkin:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get walkin by QR code
exports.getWalkinByQR = async (req, res) => {
  try {
    const { code } = req.params;

    const walkin = await Walkin.findOne({
      $or: [{ walkinNumber: code }, { invoiceNumber: code }],
    })
      .populate("services.service services.category products.product")
      .populate("services.staff", "name employeeId");

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    res.json({
      success: true,
      data: walkin,
    });
  } catch (error) {
    console.error("Error finding walkin by QR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to generate PDF and QR assets
async function generateWalkinAssets(walkin) {
  try {
    ensureUploadsDir();
    const uploadsDir = path.join(__dirname, "../uploads/walkins");

    // Generate PDF
    const pdfPath = path.join(uploadsDir, `${walkin.walkinNumber}.pdf`);
    const doc = new PDFDocument({ margin: 30 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Simple PDF content
    doc.fontSize(20).text("LUXURY SPA & SALON", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(16)
      .text(`Walk-in Invoice: ${walkin.walkinNumber}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Customer: ${walkin.customerName}`);
    doc.text(`Phone: ${walkin.customerPhone}`);
    doc.text(`Branch: ${walkin.branch}`);
    doc.text(`Total Amount: ₹${walkin.totalAmount}`);
    doc.text(`Date: ${new Date(walkin.walkinDate).toLocaleDateString()}`);
    doc.moveDown();
    doc.text("Thank you for your visit!", { align: "center" });

    doc.end();

    // Generate QR code
    const qrData = {
      walkinId: walkin._id,
      walkinNumber: walkin.walkinNumber,
      downloadUrl: `/api/v1/walkins/${walkin._id}/pdf`,
    };

    const qrCodeData = await QRCode.toDataURL(JSON.stringify(qrData));

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    return { pdfPath, qrCodeData };
  } catch (error) {
    console.error("Error generating assets:", error);
    throw error;
  }
}

// Download via QR
exports.downloadViaQR = async (req, res) => {
  try {
    const walkin = await Walkin.findById(req.params.walkinId);

    if (!walkin) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Walk-in Not Found</h1>
            <p>The requested walk-in receipt could not be found.</p>
            <p>Please contact the salon for assistance.</p>
          </body>
        </html>
      `);
    }

    const downloadUrl = `/api/v1/walkins/${walkin._id}/pdf`;

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Download Walk-in Receipt - ${walkin.walkinNumber}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          .success-icon {
            font-size: 60px;
            color: #10b981;
            margin-bottom: 20px;
          }
          .details {
            background: #f8fafc;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .detail-label {
            color: #64748b;
            font-weight: 500;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          .download-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
            margin-top: 20px;
          }
          .download-btn:hover {
            background: #2563eb;
          }
          .auto-download {
            color: #10b981;
            font-weight: 600;
            margin-top: 20px;
          }
          .note {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 20px;
          }
        </style>
        <script>
          setTimeout(() => {
            window.location.href = '${downloadUrl}';
          }, 2000);
          
          function manualDownload() {
            window.location.href = '${downloadUrl}';
          }
          
          let downloadStarted = false;
          setInterval(() => {
            if (!downloadStarted) {
              document.getElementById('autoDownloadMsg').innerHTML = 
                'If download doesn\'t start automatically, <button onclick="manualDownload()" style="background: none; border: none; color: #3b82f6; cursor: pointer; text-decoration: underline;">click here</button>';
            }
          }, 3000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Receipt Ready to Download</h1>
          <p>Your walk-in receipt is being prepared for download.</p>
          
          <div class="details">
            <div class="detail-item">
              <span class="detail-label">Walk-in #</span>
              <span class="detail-value">${walkin.walkinNumber}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Customer</span>
              <span class="detail-value">${walkin.customerName}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Date</span>
              <span class="detail-value">${new Date(
                walkin.walkinDate
              ).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Amount</span>
              <span class="detail-value">₹${walkin.totalAmount.toFixed(
                2
              )}</span>
            </div>
          </div>
          
          <p class="auto-download" id="autoDownloadMsg">
            Download will start automatically in 2 seconds...
          </p>
          
          <button class="download-btn" onclick="manualDownload()">
            Download Receipt Now
          </button>
          
          <p class="note">
            Luxury Spa & Salon<br>
            Thank you for your visit!
          </p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("QR download error:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Error</h1>
          <p>Failed to process your request. Please try again later.</p>
        </body>
      </html>
    `);
  }
};

// Get branches for frontend
exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch branches",
    });
  }
};

// Get employee roles
exports.getEmployeeRoles = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");

    const roles = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      category: cat._id,
    }));

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching employee roles:", error);
    res.status(500).json({
      success: false,
      data: [],
    });
  }
};

// Get staff filtered by branch AND service category
exports.getFilteredStaff = async (req, res) => {
  try {
    const { branch, categoryId } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    let category = null;
    let assignedRole = "";

    if (categoryId) {
      category = await Category.findById(categoryId);
      if (category) {
        assignedRole = category.assignedEmployeeRole || "";
      }
    }

    let query = {
      role: "employee",
      workingLocation: branch,
      status: "free",
    };

    if (assignedRole) {
      query.employeeRole = { $regex: `^${assignedRole}$`, $options: "i" };
    }

    const staff = await User.find(query)
      .select(
        "name email phone employeeId employeeRole status workingLocation shift"
      )
      .sort("name");

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching filtered staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      data: [],
    });
  }
};

// Get all staff for a branch
exports.getBranchStaff = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    const staff = await User.find({
      role: "employee",
      workingLocation: branch,
      status: "free",
    })
      .select(
        "name email phone employeeId employeeRole status workingLocation shift"
      )
      .sort("name");

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching branch staff:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      data: [],
    });
  }
};
// walkinController.js - NEW COMPLETE UPDATE FUNCTION
// walkinController.js - FIXED completeUpdateWalkin function
exports.completeUpdateWalkin = async (req, res) => {
  try {
    const walkinId = req.params.id;
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      notes,
      branch,
      addServices = [],
      removeServiceIds = [],
      addProducts = [],
      removeProductIds = [],
      discount,
      paymentMethod,
      amountPaid,
      status,
    } = req.body;

    console.log(`Complete update for walkin: ${walkinId}`, req.body);

    // Find the walkin with all populated data
    const walkin = await Walkin.findById(walkinId)
      .populate("services.service")
      .populate("products.product");

    if (!walkin) {
      return res.status(404).json({
        success: false,
        message: "Walkin not found",
      });
    }

    const previousStatus = walkin.status;
    const previousProducts = [...walkin.products];

    // ==================== UPDATE BASIC INFO ====================
    if (customerName !== undefined) walkin.customerName = customerName;
    if (customerPhone !== undefined) walkin.customerPhone = customerPhone;
    if (customerEmail !== undefined) walkin.customerEmail = customerEmail;
    if (customerAddress !== undefined) walkin.customerAddress = customerAddress;
    if (notes !== undefined) walkin.notes = notes;
    if (branch !== undefined) walkin.branch = branch;
    if (discount !== undefined) walkin.discount = parseFloat(discount) || 0;
    if (paymentMethod !== undefined) walkin.paymentMethod = paymentMethod;
    if (amountPaid !== undefined)
      walkin.amountPaid = parseFloat(amountPaid) || 0;
    if (status !== undefined) walkin.status = status;

    walkin.updatedBy = req.user?._id || null;

    // ==================== REMOVE SERVICES ====================
    if (removeServiceIds.length > 0) {
      walkin.services = walkin.services.filter(
        (service) => !removeServiceIds.includes(service._id.toString())
      );
      console.log(`Removed ${removeServiceIds.length} services`);
    }

    // ==================== ADD NEW SERVICES ====================
    if (addServices.length > 0) {
      for (const serviceItem of addServices) {
        try {
          console.log("Processing new service:", serviceItem);

          const service = await Service.findById(
            serviceItem.serviceId
          ).populate("category");

          if (!service) {
            console.error(`Service not found: ${serviceItem.serviceId}`);
            continue;
          }

          console.log("Found service:", service.name);

          // Find the pricing option
          let pricing;
          if (serviceItem.pricingId) {
            pricing = service.pricing.find(
              (p) => p._id.toString() === serviceItem.pricingId
            );
          } else if (serviceItem.price) {
            // If no pricingId but price is provided, use that
            pricing = {
              _id: new mongoose.Types.ObjectId(),
              price: parseFloat(serviceItem.price),
              durationMinutes: serviceItem.duration || 30,
            };
          }

          if (!pricing) {
            console.error("No pricing found for service");
            continue;
          }

          console.log("Pricing:", pricing);

          // Add to walkin services
          walkin.services.push({
            category: service.category?._id || null,
            service: service._id,
            pricing: pricing._id,
            duration: pricing.durationMinutes || 30,
            price: parseFloat(pricing.price) || 0,
            staff: serviceItem.staffId || null,
          });

          console.log(`Added service: ${service.name} - ₹${pricing.price}`);
        } catch (error) {
          console.error("Error adding service:", error);
        }
      }
    }

    // ==================== REMOVE PRODUCTS ====================
    if (removeProductIds.length > 0) {
      // Release stock for products being removed
      for (const productId of removeProductIds) {
        const productItem = walkin.products.find(
          (p) => p._id.toString() === productId
        );
        if (productItem && productItem.stockDeducted) {
          const product = await Product.findById(productItem.product);
          if (product) {
            product.totalStock = product.totalStock + productItem.quantity;
            await product.save();
            console.log(`Released stock for product: ${product.name}`);
          }
        }
      }

      walkin.products = walkin.products.filter(
        (product) => !removeProductIds.includes(product._id.toString())
      );
      console.log(`Removed ${removeProductIds.length} products`);
    }

    // ==================== ADD NEW PRODUCTS ====================
    if (addProducts.length > 0) {
      for (const productItem of addProducts) {
        try {
          console.log("Processing new product:", productItem);

          const product = await Product.findById(productItem.productId);

          if (!product) {
            console.error(`Product not found: ${productItem.productId}`);
            continue;
          }

          console.log("Found product:", product.name);

          const quantity = parseInt(productItem.quantity) || 1;
          const availableStock = product.totalStock - (product.inUseStock || 0);

          // Check stock availability
          if (availableStock < quantity) {
            console.error(`Insufficient stock for ${product.name}`);
            continue;
          }

          const productPrice = parseFloat(product.price) || 0;
          const productTotal = productPrice * quantity;

          console.log(`Product price: ${productPrice}, Total: ${productTotal}`);

          walkin.products.push({
            product: product._id,
            quantity: quantity,
            price: productPrice,
            total: productTotal,
            stockDeducted: false,
            availableStockAtBooking: availableStock,
          });

          console.log(
            `Added product: ${product.name} x${quantity} - ₹${productTotal}`
          );
        } catch (error) {
          console.error("Error adding product:", error);
        }
      }
    }

    // ==================== RECALCULATE TOTALS - FIXED ====================
    console.log("Recalculating totals...");

    let servicesTotal = 0;
    walkin.services.forEach((service) => {
      const price = parseFloat(service.price) || 0;
      console.log(`Service price: ${price}`);
      servicesTotal += price;
    });

    let productsTotal = 0;
    walkin.products.forEach((product) => {
      const total = parseFloat(product.total) || 0;
      console.log(`Product total: ${total}`);
      productsTotal += total;
    });

    console.log(`Services total: ${servicesTotal}`);
    console.log(`Products total: ${productsTotal}`);

    const discountAmount = parseFloat(walkin.discount) || 0;

    walkin.subtotal = servicesTotal + productsTotal;
    walkin.totalAmount = walkin.subtotal - discountAmount;
    walkin.dueAmount = walkin.totalAmount - (walkin.amountPaid || 0);

    console.log(
      `Final totals - Subtotal: ${walkin.subtotal}, Total: ${walkin.totalAmount}, Due: ${walkin.dueAmount}`
    );

    // Update payment status
    if (walkin.dueAmount > 0) {
      walkin.paymentStatus = "partially_paid";
    } else {
      walkin.paymentStatus = "paid";
    }

    // ==================== SAVE WALKIN FIRST ====================
    try {
      await walkin.save();
      console.log("Walkin saved successfully");
    } catch (saveError) {
      console.error("Error saving walkin:", saveError);
      throw saveError;
    }

    // ==================== HANDLE STOCK ====================
    // If status changed to confirmed/completed, deduct stock
    if (
      (walkin.status === "confirmed" || walkin.status === "completed") &&
      (previousStatus === "draft" || previousStatus === "cancelled")
    ) {
      await deductStockForWalkin(walkinId);
    }

    // If status changed to cancelled, release stock
    if (
      walkin.status === "cancelled" &&
      (previousStatus === "confirmed" || previousStatus === "completed")
    ) {
      await releaseStockForWalkin(walkinId);
    }

    // Deduct stock for newly added products if walkin is already confirmed
    if (walkin.status === "confirmed" || walkin.status === "completed") {
      // Reload walkin with updated products
      const updatedWalkin = await Walkin.findById(walkinId);
      for (const productItem of updatedWalkin.products) {
        if (!productItem.stockDeducted) {
          const product = await Product.findById(productItem.product);
          if (product) {
            // Check stock availability
            if (product.totalStock >= productItem.quantity) {
              product.totalStock = product.totalStock - productItem.quantity;
              await product.save();
              productItem.stockDeducted = true;
              console.log(`Deducted stock for product: ${product.name}`);
            }
          }
        }
      }
      await updatedWalkin.save();
    }

    // ==================== REGENERATE ASSETS ====================
    try {
      const { pdfPath, qrCodeData } = await generateWalkinAssets(walkin);
      walkin.pdfUrl = `/uploads/walkins/${path.basename(pdfPath)}`;
      walkin.qrCode = qrCodeData;
      await walkin.save();
    } catch (assetError) {
      console.error("Error regenerating assets:", assetError);
      // Don't throw error, continue with response
    }

    // ==================== RETURN UPDATED WALKIN ====================
    const finalWalkin = await Walkin.findById(walkinId)
      .populate("services.service services.category products.product")
      .populate("services.staff", "name employeeId")
      .populate("createdBy updatedBy", "name email");

    res.json({
      success: true,
      message: "Walkin updated successfully",
      data: finalWalkin,
      changes: {
        servicesAdded: addServices.length,
        servicesRemoved: removeServiceIds.length,
        productsAdded: addProducts.length,
        productsRemoved: removeProductIds.length,
        stockAdjusted: true,
      },
    });
  } catch (error) {
    console.error("Error in complete update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update walkin: " + error.message,
    });
  }
};
// 🆕 Get walkins assigned to specific employee
exports.getEmployeeWalkins = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const walkins = await Walkin.find({
      "services.staff": employeeId,
    })
      .populate("services.service")
      .populate("services.staff", "name employeeId")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: walkins,
    });
  } catch (error) {
    console.error("Error fetching employee walkins:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
