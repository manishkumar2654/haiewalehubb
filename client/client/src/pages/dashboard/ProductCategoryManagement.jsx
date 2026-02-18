import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Trash2, Plus, Loader } from "lucide-react";

const ProductCategoryManagement = ({ refreshCategories }) => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/product-categories");
      setCategories(res.data);
    } catch {
      addToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await api.post("/product-categories", { name });
      setName("");
      fetchCategories();
      refreshCategories && refreshCategories();
      addToast("Category added", "success");
    } catch {
      addToast("Failed to add category", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/product-categories/${id}`);
      fetchCategories();
      refreshCategories && refreshCategories();
      addToast("Category deleted", "success");
    } catch {
      addToast("Failed to delete category", "error");
    }
  };

  return (
    <Card className="p-4 text-black">
      <h3 className="text-lg font-semibold mb-4">Manage Product Categories</h3>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-l px-3 py-2 flex-grow"
        />
        <Button onClick={handleAdd} className="rounded-l-none">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {loading ? (
        <Loader className="h-6 w-6 animate-spin text-indigo-600" />
      ) : (
        <ul>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className="flex justify-between items-center py-2 border-b"
            >
              <span>{cat.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(cat._id)}
                className="text-red-600 border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default ProductCategoryManagement;
