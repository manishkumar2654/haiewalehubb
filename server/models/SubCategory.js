const mongoose = require("mongoose");
const { Schema } = mongoose;

const subcategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Subcategory ||
  mongoose.model("Subcategory", subcategorySchema);
