const Subcategory = require("../models/SubCategory");

exports.getSubcategories = async (req, res, next) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("productCategory", "name")
      .sort("name");
    res.json(subcategories);
  } catch (err) {
    next(err);
  }
};

exports.createSubcategory = async (req, res, next) => {
  try {
    const { name, productCategory } = req.body;
    if (await Subcategory.findOne({ name, productCategory })) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }
    const sub = new Subcategory({ name, productCategory });
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
};

exports.deleteSubcategory = async (req, res, next) => {
  try {
    const deleted = await Subcategory.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json({ message: "Subcategory deleted" });
  } catch (err) {
    next(err);
  }
};
