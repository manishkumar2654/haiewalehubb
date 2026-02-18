const User = require("../models/User");

// Get all addresses of current user
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (err) {
    next(err);
  }
};

// Add new address for current user
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body); // req.body should contain full address object
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// Update an address by address id in current user's addresses
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // Update fields
    Object.assign(address, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};

// Delete an address by id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.id(req.params.addressId).remove();
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};
