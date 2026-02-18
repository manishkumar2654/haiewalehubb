import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Trash2,
  PlusCircle,
  Edit2,
  X,
  Check,
  Tag,
  List,
  Grid,
  Image as ImageIcon,
} from "lucide-react";
import CategoryManagement from "./CategoryManagement";

const defaultPricingRow = {
  duration: "",
  durationMinutes: "",
  price: "",
  label: "",
};

const ServiceManagement = () => {
  // Tabs for navigation
  const tabs = [
    { id: "services", label: "Services" },
    { id: "categories", label: "Categories" },
  ];
  const [activeTab, setActiveTab] = useState("services");

  // Service state
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editService, setEditService] = useState(null);
  const [expandedForm, setExpandedForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    benefits: "",
    pricing: [defaultPricingRow],
    tags: "",
    isActive: true,
    images: [],
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        api.get("/admin/categories"),
        api.get("/admin/services"),
      ]);
      setCategories(categoriesRes.data);
      setServices(servicesRes.data);
      setFilteredServices(servicesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "services") {
      fetchData();
    }
  }, [activeTab]);

  // Filter services by category
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredServices(services);
    } else {
      setFilteredServices(
        services.filter((service) => service.category?._id === selectedCategory)
      );
    }
  }, [selectedCategory, services]);

  // Image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.imageUrl) urls.push(res.data.imageUrl);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch {
      alert("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input for re-upload
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBenefitsChange = (e) => {
    setFormData((prev) => ({ ...prev, benefits: e.target.value }));
  };

  // Pricing management
  const handlePricingChange = (index, field, value) => {
    setFormData((prev) => {
      const pricing = [...prev.pricing];
      pricing[index] = { ...pricing[index], [field]: value };
      return { ...prev, pricing };
    });
  };

  const addPricingRow = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { ...defaultPricingRow }],
    }));
  };

  const removePricingRow = (index) => {
    if (formData.pricing.length > 1) {
      setFormData((prev) => ({
        ...prev,
        pricing: prev.pricing.filter((_, i) => i !== index),
      }));
    }
  };

  // Edit service
  const startEdit = (service) => {
    setIsEditing(true);
    setExpandedForm(true);
    setEditService(service);
    setFormData({
      name: service.name || "",
      category: service.category?._id || "",
      description: service.description || "",
      benefits: service.benefits?.join("\n") || "",
      pricing: service.pricing?.length ? service.pricing : [defaultPricingRow],
      tags: service.tags?.join(", ") || "",
      isActive: service.isActive ?? true,
      images: service.images || [],
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setIsEditing(false);
    setExpandedForm(false);
    setEditService(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      benefits: "",
      pricing: [defaultPricingRow],
      tags: "",
      isActive: true,
      images: [],
    });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Service name is required");
      return;
    }
    if (!formData.category) {
      setError("Category is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        benefits: formData.benefits.split("\n").filter((line) => line.trim()),
        pricing: formData.pricing
          .filter((p) => p.duration || p.durationMinutes || p.price || p.label)
          .map((p) => ({
            duration: p.duration,
            durationMinutes: Number(p.durationMinutes),
            price: Number(p.price),
            label: p.label,
          })),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: formData.isActive,
        images: formData.images,
        // Add weekdays and timeSlots if needed
      };

      if (isEditing && editService) {
        const res = await api.put(
          `/admin/services/${editService._id}`,
          payload
        );
        setServices((prev) =>
          prev.map((s) => (s._id === editService._id ? res.data : s))
        );
      } else {
        const res = await api.post("/admin/services", payload);
        setServices((prev) => [...prev, res.data]);
      }
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  // Delete service
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    setLoading(true);
    try {
      await api.delete(`/admin/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError("Failed to delete service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 bg-white">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === tab.id
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Panel */}
      <div className={`${activeTab === "services" ? "block" : "hidden"}`}>
        {/* Service Management Content */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Service Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your salon services and pricing
            </p>
          </div>
          <Button
            onClick={() => setExpandedForm(!expandedForm)}
            variant={expandedForm ? "outline" : "primary"}
            className="flex items-center gap-2"
          >
            {expandedForm ? (
              <>
                <X className="h-4 w-4" />
                <span>Close Form</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Add Service</span>
              </>
            )}
          </Button>
        </div>

        {/* Service Form */}
        {expandedForm && (
          <Card className="w-full border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? "Edit Service" : "Create New Service"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-6 w-full min-w-0">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Benefits (one per line)
                    </label>
                    <textarea
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleBenefitsChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Images
                    </label>
                    <div className="mt-1 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="service-images"
                          className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload Images"}
                          <input
                            id="service-images"
                            name="images"
                            type="file"
                            multiple
                            onChange={handleImageUpload}
                            className="sr-only"
                            accept="image/*"
                            disabled={uploading}
                          />
                        </label>
                        {uploading && (
                          <span className="text-sm text-gray-500">
                            Uploading...
                          </span>
                        )}
                      </div>

                      {/* Image Previews */}
                      {formData.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.images.map((img, index) => (
                            <div
                              key={index}
                              className="relative group rounded-md overflow-hidden border border-gray-200"
                            >
                              <img
                                src={img}
                                alt={`Service preview ${index}`}
                                className="h-20 w-20 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Options
                    </label>
                    <div className="space-y-3 border border-gray-200 rounded-md p-3 w-full overflow-x-auto">
                      {formData.pricing.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[100px_120px_100px_1fr_auto] gap-2 items-center min-w-[320px] sm:min-w-0"
                        >
                          {/* Duration Minutes (Number) */}
                          <input
                            type="number"
                            placeholder="Duration (mins)"
                            value={row.durationMinutes || ""}
                            onChange={(e) =>
                              handlePricingChange(
                                idx,
                                "durationMinutes",
                                e.target.value
                              )
                            }
                            className="w-full min-w-0 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                            required
                          />

                          {/* Duration Label (String) */}
                          <input
                            type="text"
                            placeholder="Duration label"
                            value={row.duration || ""}
                            onChange={(e) =>
                              handlePricingChange(
                                idx,
                                "duration",
                                e.target.value
                              )
                            }
                            className="w-full min-w-0 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                            required
                          />

                          {/* Price */}
                          <input
                            type="number"
                            placeholder="Price"
                            value={row.price || ""}
                            onChange={(e) =>
                              handlePricingChange(idx, "price", e.target.value)
                            }
                            className="w-full min-w-0 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                            required
                          />

                          {/* Label (optional) */}
                          <input
                            type="text"
                            placeholder="Label (optional)"
                            value={row.label || ""}
                            onChange={(e) =>
                              handlePricingChange(
                                idx,
                                "label",
                                e.target.value
                              )
                            }
                            className="w-full min-w-0 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                          />

                          {/* Remove Button - own column so always visible */}
                          {formData.pricing.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removePricingRow(idx)}
                              className="flex items-center justify-center gap-1 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 text-sm whitespace-nowrap shrink-0 w-full sm:w-auto"
                            >
                              <X size={14} />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <span className="sm:col-span-1" />
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addPricingRow}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 mt-2"
                      >
                        <PlusCircle size={14} />
                        <span>Add Pricing Option</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active Service
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {isEditing && (
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={loading}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  {isEditing ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Services List */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              All Services ({filteredServices.length})
            </h2>
          </div>

          {/* Category Navigation */}
          <div className="px-5 py-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === "all"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory === category._id
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {loading && !services.length ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No services found
              {selectedCategory !== "all" ? " in this category" : ""}. Create
              your first service using the form above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {service.images?.[0] && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={service.images[0]}
                                alt={service.name}
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {service.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.category?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {service.pricing?.map((p, i) => (
                            <div key={i} className="flex items-baseline gap-2">
                              <span className="font-medium">₹{p.price}</span>
                              <span className="text-gray-500 text-xs">
                                ({p.durationMinutes || "-"} mins
                                {p.label ? ` • ${p.label}` : ""})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            onClick={() => startEdit(service)}
                            variant="icon"
                            className="text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(service._id)}
                            variant="icon"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Categories Panel */}
      <div className={`${activeTab === "categories" ? "block" : "hidden"}`}>
        <CategoryManagement />
      </div>
    </div>
  );
};

export default ServiceManagement;
