// controllers/calculationController.js
const Service = require("../models/Service");
const Product = require("../models/Product");
const Seat = require("../models/Seat");

// 🎯 ONLY PRICE CALCULATION API
exports.calculatePrice = async (req, res) => {
  try {
    const {
      services = [],
      products = [],
      seats = [],
      discount = 0,
      amountPaid = 0,
    } = req.body;

    console.log("🧮 CALCULATION REQUEST:", {
      services: services.length,
      products: products.length,
      seats: seats.length,
    });

    // Calculate services total
    let servicesTotal = 0;
    const serviceDetails = [];

    for (const serviceItem of services) {
      const service = await Service.findById(serviceItem.serviceId);
      if (!service) continue;

      let price = 0;
      if (serviceItem.pricingId) {
        const pricing = service.pricing.id(serviceItem.pricingId);
        price = pricing?.price || service.basePrice || 0;
      } else {
        price = service.basePrice || 0;
      }

      servicesTotal += price;
      serviceDetails.push({
        serviceId: service._id,
        name: service.name,
        price: price,
      });
    }

    // Calculate products total
    let productsTotal = 0;
    const productDetails = [];

    for (const productItem of products) {
      const product = await Product.findById(productItem.productId);
      if (!product) continue;

      const quantity = productItem.quantity || 1;
      const total = product.price * quantity;

      productsTotal += total;
      productDetails.push({
        productId: product._id,
        name: product.name,
        quantity: quantity,
        price: product.price,
        total: total,
      });
    }

    // FINAL TOTALS
    const subtotal = servicesTotal + productsTotal;
    const discountAmount = Number(discount) || 0;
    const totalAmount = subtotal - discountAmount;
    const dueAmount = totalAmount - (Number(amountPaid) || 0);

    const result = {
      success: true,
      data: {
        services: {
          total: servicesTotal,
          count: serviceDetails.length,
          details: serviceDetails,
        },
        products: {
          total: productsTotal,
          count: productDetails.length,
          details: productDetails,
        },

        totals: {
          subtotal: subtotal,
          discount: discountAmount,
          totalAmount: totalAmount,
          amountPaid: Number(amountPaid) || 0,
          dueAmount: dueAmount,
        },
        paymentStatus: dueAmount <= 0 ? "paid" : "pending",
      },
    };

    console.log("✅ CALCULATION RESULT:", result.data.totals);
    res.json(result);
  } catch (error) {
    console.error("❌ CALCULATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Calculation failed",
      error: error.message,
    });
  }
};
