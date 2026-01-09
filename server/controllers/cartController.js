const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper function to calculate total price
const calculateTotalPrice = (items) => {
  return items.reduce((total, item) => {
    return total + item.priceAtAddition * item.quantity;
  }, 0);
};

// Get current user's cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .lean();

    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }

    // Ensure totalPrice is calculated correctly
    cart.totalPrice = calculateTotalPrice(cart.items);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { product: productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: product.price,
      });
    }

    // Recalculate total price
    cart.totalPrice = calculateTotalPrice(cart.items);
    await cart.save();

    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = quantity;
    cart.totalPrice = calculateTotalPrice(cart.items);
    await cart.save();

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.remove();
    cart.totalPrice = calculateTotalPrice(cart.items);
    await cart.save();

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0 },
      { new: true }
    );

    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    next(err);
  }
};
