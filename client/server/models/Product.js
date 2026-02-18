const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, trim: true },

    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },

    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },

    price: { type: Number, required: true, min: 0 },

    // TOTAL STOCK (घर में कुल माल)
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },

    // IN-USE STOCK (हम इस्तेमाल कर रहे हैं)
    inUseStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// allow max 4 images
productSchema.pre("validate", function (next) {
  if (this.images.length > 4) {
    this.invalidate("images", "A product can have up to 4 images only.");
  }
  next();
});

// Validation: inUseStock cannot exceed totalStock
productSchema.pre("save", function (next) {
  if (this.inUseStock > this.totalStock) {
    const err = new Error(
      `In-use stock (${this.inUseStock}) cannot exceed total stock (${this.totalStock})`
    );
    return next(err);
  }
  next();
});

productSchema.pre("save", function (next) {
  this.availableStock = this.totalStock - this.inUseStock;
  next();
});

// Add virtual to JSON response
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
