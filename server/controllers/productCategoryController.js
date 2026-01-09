const ProductCategory = require("../models/ProductCategory");

exports.getProductCategories = async (req, res, next) => {
  try {
    const categories = await ProductCategory.find().sort("name");
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createProductCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (await ProductCategory.findOne({ name })) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = new ProductCategory({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.deleteProductCategory = async (req, res, next) => {
  try {
    const deleted = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
