const mongoose = require("mongoose");
const { Schema } = mongoose;

const productCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", productCategorySchema);
