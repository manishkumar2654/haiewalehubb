// models/Bill.js
const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  duration: { type: String, required: true },
  staffAssigned: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  gst: { type: Number, default: 5, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  gst: { type: Number, default: 5, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number, default: 0 },
});

const billSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    customerId: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    roomNo: { type: String },
    date: { type: Date, default: Date.now },

    services: [serviceSchema],
    products: [productSchema],

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return "INV-" + Math.floor(1000000 + Math.random() * 9000000);
      },
    },
    billingDate: { type: Date, default: Date.now },
    billingTime: { type: String },
    discountPercent: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      required: true,
    },

    subTotal: { type: Number },
    acharosAmount: { type: Number, default: 0 },
    totalPrice: { type: Number },

    pdfPath: { type: String },
  },
  { timestamps: true }
);

billSchema.methods.calculateTotals = function () {
  this.services.forEach((service) => {
    const total =
      service.price * (1 + service.gst / 100) * (1 - service.discount / 100);
    service.total = parseFloat(total.toFixed(2));
  });

  this.products.forEach((product) => {
    const total =
      product.quantity *
      product.unitPrice *
      (1 + product.gst / 100) *
      (1 - product.discount / 100);
    product.total = parseFloat(total.toFixed(2));
  });

  const serviceTotal = this.services.reduce(
    (acc, cur) => acc + (cur.total || 0),
    0
  );
  const productTotal = this.products.reduce(
    (acc, cur) => acc + (cur.total || 0),
    0
  );
  this.subTotal = parseFloat((serviceTotal + productTotal).toFixed(2));

  const total =
    this.subTotal * (1 - this.discountPercent / 100) + this.acharosAmount;
  this.totalPrice = parseFloat(total.toFixed(2));

  if (!this.billingTime) {
    this.billingTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

module.exports = mongoose.model("Bill", billSchema);
