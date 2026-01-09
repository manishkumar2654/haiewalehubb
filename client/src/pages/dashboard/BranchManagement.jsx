import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Edit2,
  Trash2,
  PlusCircle,
  X,
  Check,
  Building,
  MapPin,
  Phone,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formVisible, setFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBranch, setEditBranch] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    landline: "",
    workingHours: "9:00 AM - 9:00 PM",
    rooms: "",
    premium: false,
    isActive: true,
    lat: "",
    lng: "",
  });

  const branchTypes = ["Gold", "Diamond", "Silver"];

  // Fetch all branches
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/branches");
      setBranches(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch branches");
      console.error("Error fetching branches:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Input change handler
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addNewBranch = () => {
    setForm({
      name: "",
      address: "",
      phone: "",
      landline: "",
      workingHours: "9:00 AM - 9:00 PM",
      rooms: "",
      premium: false,
      isActive: true,
      lat: "",
      lng: "",
    });

    setEditBranch(null);
    setIsEditing(false);
    setFormVisible(true);
  };

  const editExistingBranch = (branch) => {
    setForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      landline: branch.landline || "",
      workingHours: branch.workingHours || "9:00 AM - 9:00 PM",
      rooms: branch.rooms || "",
      premium: branch.premium || false,
      isActive: branch.isActive !== false,
      lat: branch.location?.lat || "",
      lng: branch.location?.lng || "",
    });

    setEditBranch(branch);
    setIsEditing(true);
    setFormVisible(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.phone) {
      setError("Name, Address, and Phone are required");
      return;
    }

    setLoading(true);

    // ✅ BUILD FINAL PAYLOAD
    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      landline: form.landline,
      workingHours: form.workingHours,
      rooms: form.rooms,
      premium: form.premium,
      isActive: form.isActive,
      location:
        form.lat && form.lng
          ? {
              lat: Number(form.lat),
              lng: Number(form.lng),
            }
          : undefined, // 👈 optional
    };

    try {
      if (isEditing) {
        const res = await api.put(`/admin/branches/${editBranch._id}`, payload);

        setBranches((b) =>
          b.map((branch) =>
            branch._id === editBranch._id ? res.data.branch : branch
          )
        );
      } else {
        const res = await api.post("/admin/branches", payload);
        setBranches((b) => [...b, res.data.branch]);
      }

      setError(null);
      setFormVisible(false);
      setIsEditing(false);
      setEditBranch(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save branch");
    }

    setLoading(false);
  };

  // Delete branch (soft delete)
  const deleteBranch = async (branch) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          branch.isActive ? "deactivate" : "activate"
        } ${branch.name} branch?`
      )
    )
      return;

    setLoading(true);
    try {
      const updatedBranch = { ...branch, isActive: !branch.isActive };
      await api.put(`/admin/branches/${branch._id}`, updatedBranch);
      fetchBranches(); // Refresh list
    } catch {
      setError("Failed to update branch status");
    }
    setLoading(false);
  };

  // Get color based on branch type
  const getBranchColor = (branchName) => {
    switch (branchName) {
      case "Gold":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
        };
      case "Diamond":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      case "Silver":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Branch Management
          </h2>
          <p className="text-gray-600">
            Manage your spa branches and locations
          </p>
        </div>
        <Button
          onClick={addNewBranch}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          <span>Add Branch</span>
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {formVisible && (
        <Card className="mb-8 border border-blue-100 shadow-lg">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? "Edit Branch" : "Add New Branch"}
            </h3>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                >
                  <option value="">Select Branch Type</option>
                  {branchTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  required
                  placeholder="e.g., 9713326656"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Landline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landline
                </label>
                <input
                  name="landline"
                  value={form.landline}
                  onChange={onChange}
                  placeholder="e.g., 0731-4996661"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Hours
                </label>
                <input
                  name="workingHours"
                  value={form.workingHours}
                  onChange={onChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Rooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rooms Information
                </label>
                <input
                  name="rooms"
                  value={form.rooms}
                  onChange={onChange}
                  placeholder="e.g., 10 Rooms + 8 Couple Rooms"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Premium Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="premium"
                  checked={form.premium}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Premium Branch
                </label>
              </div>

              {/* Active Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Active Branch
                </label>
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  required
                  rows="3"
                  placeholder="Full branch address..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>
              {/* Latitude & Longitude */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Latitude
                </label>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={onChange}
                  placeholder="e.g. 22.7196"
                  className="w-full border border-gray-300 text-black rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                name="lng"
                value={form.lng}
                onChange={onChange}
                placeholder="e.g. 75.8577"
                className="w-full border border-gray-300 text-black rounded-md px-3 py-2"
              />
            </div>

            <p className="text-xs text-gray-500 md:col-span-2">
              Tip: Open Google Maps → Right click on location → Copy latitude &
              longitude
            </p>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                onClick={() => {
                  setFormVisible(false);
                  setIsEditing(false);
                  setEditBranch(null);
                }}
                type="button"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Check size={16} className="mr-2" />
                {isEditing ? "Update Branch" : "Add Branch"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Branches Grid */}
      {loading && !branches.length ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : branches.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <Building className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No branches available</p>
          <p className="mt-2">Click "Add Branch" to create your first branch</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => {
            const colors = getBranchColor(branch.name);

            return (
              <Card
                key={branch._id}
                className={`border ${colors.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
              >
                <div
                  className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Building className={`h-5 w-5 ${colors.text} mr-2`} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {branch.name} Branch
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {branch.premium && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          Premium
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          branch.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {branch.phone}
                          </p>
                          {branch.landline && (
                            <p className="text-xs text-gray-500">
                              Landline: {branch.landline}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">
                        {branch.workingHours}
                      </span>
                    </div>

                    {/* Rooms Info */}
                    {branch.rooms && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">
                          {branch.rooms}
                        </span>
                      </div>
                    )}

                    {/* Warning if inactive */}
                    {!branch.isActive && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                          <p className="text-sm text-yellow-700">
                            This branch is currently inactive
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                    <Button
                      onClick={() => editExistingBranch(branch)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Edit2 size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteBranch(branch)}
                      variant="outline"
                      size="sm"
                      className={`${
                        branch.isActive
                          ? "text-red-600 border-red-300 hover:bg-red-50"
                          : "text-green-600 border-green-300 hover:bg-green-50"
                      }`}
                    >
                      <Trash2 size={14} className="mr-1" />
                      {branch.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Statistics */}
      {branches.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total Branches</p>
            <p className="text-2xl font-bold text-gray-800">
              {branches.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Active Branches</p>
            <p className="text-2xl font-bold text-green-600">
              {branches.filter((b) => b.isActive).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Premium Branches</p>
            <p className="text-2xl font-bold text-purple-600">
              {branches.filter((b) => b.premium).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Inactive Branches</p>
            <p className="text-2xl font-bold text-red-600">
              {branches.filter((b) => !b.isActive).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
