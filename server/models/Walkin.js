const mongoose = require("mongoose");

const walkinServiceSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  pricing: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  duration: Number,
  price: Number,
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const walkinProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price: Number,
  total: Number,
  // Track if stock has been deducted
  stockDeducted: {
    type: Boolean,
    default: false,
  },
  // Store available stock at time of booking for reference
  availableStockAtBooking: Number,
});
const walkinSeatSchema = new mongoose.Schema({
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
  },
  seatNumber: String,
  seatType: String,
  duration: Number,
  price: Number,
  total: Number,
  bookedAt: Date,
});
const walkinSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: String,
    customerAddress: String,
    notes: String,

    // Walkin Details
    walkinNumber: {
      type: String,
      unique: true,
    },
    branch: {
      type: String,
      required: true,
    },
    walkinDate: {
      type: Date,
      default: Date.now,
    },

    // Services & Products
    services: [walkinServiceSchema],
    products: [walkinProductSchema],
    seats: [walkinSeatSchema],

    // Pricing
    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partially_paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "credit"],
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },

    // Status & Tracking
    status: {
      type: String,
      enum: ["draft", "confirmed", "in_progress", "completed", "cancelled"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // PDF & QR
    pdfUrl: String,
    qrCode: String,
    invoiceNumber: String,
  },
  { timestamps: true }
);

// Generate walkin number
walkinSchema.pre("save", function (next) {
  if (!this.walkinNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    this.walkinNumber = `WN-${year}${month}${random}`;
    this.invoiceNumber = `INV-${year}${month}${random}`;
  }

  // Calculate due amount
  this.dueAmount = this.totalAmount - this.amountPaid;

  next();
});

// Calculate totals before save
walkinSchema.pre("save", function (next) {
  let servicesTotal = 0;
  this.services.forEach((service) => {
    servicesTotal += service.price;
  });

  let productsTotal = 0;
  this.products.forEach((product) => {
    productsTotal += product.total;
  });
  let seatsTotal = 0;
  this.seats?.forEach((seat) => {
    seatsTotal += seat.total || 0;
  });
  this.subtotal = servicesTotal + productsTotal + seatsTotal;
  this.totalAmount = Math.max(this.subtotal - (this.discount || 0), 0);

  next();
});

module.exports = mongoose.model("Walkin", walkinSchema);
