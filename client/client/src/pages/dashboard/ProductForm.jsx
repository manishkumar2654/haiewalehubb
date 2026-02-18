import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { X, Upload, AlertCircle, Info } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ProductForm = ({
  product,
  categories,
  subcategories,
  onSubmit,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productCategory: "",
    subcategory: "",
    price: "",
    totalStock: "",
    inUseStock: "0",
    images: [],
  });
  const [uploading, setUploading] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        productCategory: product.productCategory?._id || "",
        subcategory: product.subcategory?._id || "",
        price: product.price || "",
        totalStock: product.totalStock?.toString() || "",
        inUseStock: product.inUseStock?.toString() || "0",
        images: product.images || [],
      });
    }
  }, [product]);

  useEffect(() => {
    if (formData.productCategory) {
      const filtered = subcategories.filter(
        (sub) =>
          sub.productCategory?._id === formData.productCategory ||
          sub.productCategory === formData.productCategory
      );
      setFilteredSubcategories(filtered);

      if (!filtered.some((sub) => sub._id === formData.subcategory)) {
        setFormData((prev) => ({ ...prev, subcategory: "" }));
      }
    } else {
      setFilteredSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory: "" }));
    }
  }, [formData.productCategory, subcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "totalStock") {
      const newTotal = parseInt(value) || 0;
      const currentInUse = parseInt(formData.inUseStock) || 0;

      if (currentInUse > newTotal) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          inUseStock: newTotal.toString(),
        }));
        addToast(`In-use stock adjusted to ${newTotal}`, "info");
        return;
      }
    }

    if (name === "inUseStock") {
      const newInUse = parseInt(value) || 0;
      const currentTotal = parseInt(formData.totalStock) || 0;

      if (newInUse > currentTotal) {
        addToast(
          `In-use cannot exceed total stock (${currentTotal})`,
          "warning"
        );
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    if (formData.images.length >= 4) {
      addToast("Maximum 4 images allowed", "warning");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const res = await api.post("/upload", formDataObj, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, res.data.imageUrl],
      }));
    } catch (err) {
      addToast("Failed to upload image", "error");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalStock = parseInt(formData.totalStock) || 0;
    const inUseStock = parseInt(formData.inUseStock) || 0;

    if (totalStock <= 0) {
      addToast("Total stock must be greater than 0", "error");
      return;
    }

    if (inUseStock > totalStock) {
      addToast("In-use stock cannot exceed total stock", "error");
      return;
    }

    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      totalStock: totalStock,
      inUseStock: inUseStock,
    });
  };

  const totalStock = parseInt(formData.totalStock) || 0;
  const inUseStock = parseInt(formData.inUseStock) || 0;
  const availableStock = totalStock - inUseStock;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-black">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="productCategory"
              value={formData.productCategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              required
            >
              <option value="" className="text-gray-500">
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                  className="text-black"
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Total Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalStock"
              min="1"
              value={formData.totalStock}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              required
              placeholder="Enter total quantity"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Subcategory
            </label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              disabled={!formData.productCategory}
            >
              <option value="" className="text-gray-500">
                Select a subcategory
              </option>
              {filteredSubcategories.map((subcategory) => (
                <option
                  key={subcategory._id}
                  value={subcategory._id}
                  className="text-black"
                >
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              In-Use Stock
            </label>
            <input
              type="number"
              name="inUseStock"
              min="0"
              max={totalStock}
              value={formData.inUseStock}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Items used internally"
            />
          </div>

          {/* Stock Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center text-black mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-semibold">Stock Summary</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-300">
                  <div className="text-2xl font-bold text-black">
                    {totalStock}
                  </div>
                  <div className="text-xs text-gray-600">Total Stock</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-300">
                  <div className="text-2xl font-bold text-black">
                    {inUseStock}
                  </div>
                  <div className="text-xs text-gray-600">In Use</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-300">
                  <div className="text-2xl font-bold text-black">
                    {availableStock}
                  </div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-300">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium text-black">Formula</span>
                </div>
                <div className="text-center text-sm text-black">
                  <span>Total</span>
                  <span className="mx-2">-</span>
                  <span>In Use</span>
                  <span className="mx-2">=</span>
                  <span className="font-bold">Available</span>
                </div>
                <div className="text-center text-xs text-gray-700 mt-1">
                  ({totalStock} - {inUseStock} = {availableStock})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          required
          placeholder="Enter detailed product description..."
        />
      </div>

      {/* Images */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-sm font-medium text-black">
              Product Images
            </label>
            <p className="text-sm text-gray-600">
              Upload up to 4 images. First image will be displayed as main.
            </p>
          </div>
          <span className="text-sm text-gray-600">
            {formData.images.length}/4 images
          </span>
        </div>

        <div className="flex flex-wrap gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}

          {formData.images.length < 4 && (
            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              {uploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <span className="text-xs text-gray-600 mt-2">
                    Uploading...
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-700">Add Image</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Click to upload
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2.5 border-gray-300 text-black hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
