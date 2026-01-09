import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Edit, Trash2, Plus, X, Check, Users } from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true,
    assignedEmployeeRole: "",
  });
  const [expandedForm, setExpandedForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load categories");
    }
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("/admin/categories/roles/list");
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const startEdit = (category) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      order: category.order || 0,
      isActive: category.isActive,
      assignedEmployeeRole: category.assignedEmployeeRole || "",
    });
    setIsEditing(true);
    setExpandedForm(true);
  };

  const cancelEdit = () => {
    setEditCategory(null);
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      order: 0,
      isActive: true,
      assignedEmployeeRole: "",
    });
    setExpandedForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!formData.assignedEmployeeRole) {
      setError("Assigned Employee Role is required");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editCategory) {
        const res = await api.put(
          `/admin/categories/${editCategory._id}`,
          formData
        );
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editCategory._id ? res.data : cat))
        );
      } else {
        const res = await api.post("/admin/categories", formData);
        setCategories((prev) => [...prev, res.data]);
      }
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setLoading(true);
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setExpandedForm(!expandedForm);
    if (expandedForm && isEditing) {
      cancelEdit();
    }
  };

  return (
    <div className="max-w-7x text-black mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Category Management
        </h1>
        <Button
          onClick={toggleForm}
          className="flex items-center gap-2"
          variant={expandedForm ? "outline" : "primary"}
        >
          {expandedForm ? (
            <>
              <X className="h-4 w-4" />
              <span>Close Form</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      {expandedForm && (
        <Card>
          <div className="px-5 py-4 border-b">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Category" : "Add New Category"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm mb-1">Category Name*</label>
                <input
                  name="name"
                  type="text"
                  className="border px-3 py-2 rounded w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm mb-1">
                  Assigned Employee Role*
                </label>
                <select
                  name="assignedEmployeeRole"
                  className="border px-3 py-2 rounded w-full"
                  value={formData.assignedEmployeeRole}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Description</label>
              <textarea
                name="description"
                className="border px-3 py-2 rounded w-full"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm mb-1">Display Order</label>
                <input
                  name="order"
                  type="number"
                  className="border px-3 py-2 rounded w-full"
                  value={formData.order}
                  onChange={handleInputChange}
                  disabled={loading}
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Active</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {isEditing && (
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                <Check className="w-4 h-4 mr-1" />
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card>
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Categories ({categories.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Name",
                  "Assigned Role",
                  "Description",
                  "Order",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length ? (
                categories
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => (
                    <tr key={cat._id}>
                      <td className="px-6 py-4">{cat.name}</td>
                      <td className="px-6 py-4">{cat.assignedEmployeeRole}</td>
                      <td className="px-6 py-4">{cat.description || "-"}</td>
                      <td className="px-6 py-4">{cat.order}</td>
                      <td className="px-6 py-4">
                        {cat.isActive ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button variant="icon" onClick={() => startEdit(cat)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="icon"
                          onClick={() => handleDelete(cat._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CategoryManagement;
