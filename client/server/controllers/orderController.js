require("dotenv").config();
const axios = require("axios");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RP_KEY_ID,
  key_secret: process.env.RP_KEY_SECRET,
});

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      paymentMethod,
      shippingAddress,
      taxPrice = 0,
      shippingPrice = 0,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build orderItems snapshot
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.priceAtAddition,
      image: item.product.images[0],
    }));

    const itemsPrice = cart.totalPrice;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // If ONLINE, create Razorpay order
    if (paymentMethod === "ONLINE") {
      const options = {
        amount: Math.round(totalPrice * 100), // in paise
        currency: "INR",
        receipt: `rcpt_${order._id}`,
      };
      const rpOrder = await razorpay.orders.create(options);
      order.paymentResult = {
        razorpayOrderId: rpOrder.id,
        status: rpOrder.status,
      };
      await order.save();
      return res.status(201).json({ order, razorpayOrder: rpOrder });
    }

    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalPrice: 0 } }
    );

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/v1/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RP_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findOne({
      "paymentResult.razorpayOrderId": razorpayOrderId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: "paid",
    };

    await order.save();

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalPrice: 0 } }
    );

    res.json({ message: "Payment verified", order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate({
        path: "orderItems.product",
        select: "name images",
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's orders
// @route   GET /api/v1/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc    Admin updates order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const { isDelivered } = req.body;
    if (typeof isDelivered === "boolean") {
      order.isDelivered = isDelivered;
      order.deliveredAt = isDelivered ? Date.now() : null;
    }
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
// @desc    Get all orders (admin)
// @route   GET /api/v1/admin/orders
// @access  Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};
