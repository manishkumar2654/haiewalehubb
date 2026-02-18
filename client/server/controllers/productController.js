const Product = require("../models/Product");
const { cloudinary } = require("../config/cloudinary");

exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      productCategory,
      subcategory,
      price,
      totalStock,
      inUseStock,
    } = req.body;

    // Get array of Cloudinary image URLs
    let images = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    } else if (req.files?.length) {
      images = req.files.map((file) => file.path);
    }

    const product = new Product({
      name,
      images,
      description,
      productCategory,
      subcategory,
      price,
      totalStock: parseInt(totalStock) || 0,
      inUseStock: parseInt(inUseStock) || 0,
    });

    const created = await product.save();
    res.status(201).json(created);
  } catch (err) {
    // Delete uploaded files if error occurs
    if (req.files?.length) {
      await Promise.all(
        req.files.map((file) => cloudinary.uploader.destroy(file.filename))
      );
    }
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("productCategory", "name")
      .populate("subcategory", "name productCategory")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id)
      .populate("productCategory", "name")
      .populate("subcategory", "name productCategory");

    if (!prod) return res.status(404).json({ message: "Product not found" });

    // Add virtual field to response
    const productObj = prod.toObject();
    productObj.availableStock = prod.availableStock;

    res.json(productObj);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      description,
      productCategory,
      subcategory,
      price,
      totalStock,
      inUseStock,
    } = req.body;

    if (name !== undefined) prod.name = name;
    if (description !== undefined) prod.description = description;
    if (productCategory !== undefined) prod.productCategory = productCategory;
    if (subcategory !== undefined) prod.subcategory = subcategory;
    if (price !== undefined) prod.price = price;
    if (totalStock !== undefined) prod.totalStock = parseInt(totalStock);
    if (inUseStock !== undefined) prod.inUseStock = parseInt(inUseStock);

    // Validate inUseStock <= totalStock
    if (prod.inUseStock > prod.totalStock) {
      return res.status(400).json({
        message: `In-use stock (${prod.inUseStock}) cannot exceed total stock (${prod.totalStock})`,
      });
    }

    // Use images from frontend if provided, else from uploaded files
    if (req.body.images && Array.isArray(req.body.images)) {
      prod.images = req.body.images;
    } else if (req.files?.length) {
      prod.images = req.files.map((f) => f.path);
    }

    const updated = await prod.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
exports.deleteProduct = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });

    // Delete images from Cloudinary
    if (prod.images?.length) {
      await Promise.all(
        prod.images.map((imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(`ecommerce-products/${publicId}`);
        })
      );
    }

    await prod.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    next(err);
  }
};

// NEW: Book product API
exports.bookProduct = async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    await prod.bookProduct(quantity);

    res.json({
      message: `Product booked successfully`,
      product: prod,
      availableStock: prod.availableStock,
    });
  } catch (err) {
    next(err);
  }
};

// NEW: Release booked product API
exports.releaseBooked = async (req, res, next) => {
  try {
    const { quantity = 1 } = req.body;
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    await prod.releaseBooked(quantity);

    res.json({
      message: `Booked product released`,
      product: prod,
      availableStock: prod.availableStock,
    });
  } catch (err) {
    next(err);
  }
};

// NEW: Mark product as in use
exports.markAsInUse = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    await prod.markAsInUse();

    res.json({
      message: `Product marked as in use`,
      product: prod,
    });
  } catch (err) {
    next(err);
  }
};

// NEW: Return product from use
exports.returnFromUse = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    await prod.returnFromUse();

    res.json({
      message: `Product returned from use`,
      product: prod,
      availableStock: prod.availableStock,
    });
  } catch (err) {
    next(err);
  }
};

// NEW: Get available products
exports.getAvailableProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      status: "available",
      availableStock: { $gt: 0 },
    })
      .populate("productCategory", "name")
      .populate("subcategory", "name productCategory")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};
exports.setInUseQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    if (quantity > prod.stock) {
      return res.status(400).json({
        message: `In-use quantity cannot exceed total stock (${prod.stock})`,
      });
    }

    prod.inUseQuantity = parseInt(quantity);
    await prod.save();

    res.json({
      message: `In-use quantity updated to ${quantity}`,
      product: prod,
      availableStock: prod.availableStock,
    });
  } catch (err) {
    next(err);
  }
};

// Get product with stock details
exports.getProductStockDetails = async (req, res, next) => {
  try {
    const prod = await Product.findById(req.params.id)
      .populate("productCategory", "name")
      .populate("subcategory", "name productCategory");

    if (!prod) return res.status(404).json({ message: "Product not found" });

    const productWithStock = {
      ...prod.toObject(),
      availableStock: prod.availableStock,
    };

    res.json(productWithStock);
  } catch (err) {
    next(err);
  }
};
exports.setInUseStock = async (req, res, next) => {
  try {
    const { inUseStock } = req.body;
    const prod = await Product.findById(req.params.id);

    if (!prod) return res.status(404).json({ message: "Product not found" });

    if (inUseStock > prod.totalStock) {
      return res.status(400).json({
        message: `In-use stock cannot exceed total stock (${prod.totalStock})`,
      });
    }

    prod.inUseStock = parseInt(inUseStock);
    await prod.save();

    res.json({
      message: `In-use stock updated to ${inUseStock}`,
      product: prod,
      availableStock: prod.availableStock, // Virtual field
    });
  } catch (err) {
    next(err);
  }
};
