import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Trash2, Plus, Loader } from "lucide-react";

const SubcategoryManagement = ({ categories, subcategories, refreshData }) => {
  const { addToast } = useToast();
  const [localSubcategories, setLocalSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Update local subcategories when props change
  useEffect(() => {
    setLocalSubcategories(subcategories || []);
  }, [subcategories]);

  const handleAdd = async () => {
    if (!name.trim() || !selectedCategory) {
      addToast("Please enter subcategory name and select a category", "error");
      return;
    }

    try {
      setLoading(true);
      await api.post("/subcategories", {
        name: name.trim(),
        productCategory: selectedCategory,
      });

      setName("");
      setSelectedCategory("");
      refreshData && refreshData();
      addToast("Subcategory added successfully", "success");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to add subcategory",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;

    try {
      await api.delete(`/subcategories/${id}`);
      refreshData && refreshData();
      addToast("Subcategory deleted successfully", "success");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete subcategory",
        "error"
      );
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => cat._id === categoryId || cat._id === categoryId?._id
    );
    return category?.name || "Unknown Category";
  };

  return (
    <Card className="p-6 text-black">
      <h3 className="text-xl font-semibold mb-6">Manage Subcategories</h3>

      {/* Add new subcategory form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Subcategory name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button
          onClick={handleAdd}
          disabled={loading}
          className="flex items-center justify-center"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Add Subcategory
        </Button>
      </div>

      {/* Subcategories list */}
      {localSubcategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No subcategories found. Add some subcategories to get started.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4 font-semibold text-gray-700 pb-2 border-b">
            <span>Subcategory Name</span>
            <span>Parent Category</span>
            <span>Actions</span>
          </div>

          {localSubcategories.map((sub) => (
            <div
              key={sub._id}
              className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-100 hover:bg-gray-50"
            >
              <span className="font-medium">{sub.name}</span>
              <span className="text-gray-600">
                {getCategoryName(sub.productCategory)}
              </span>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(sub._id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SubcategoryManagement;
