// src/pages/admin/AdminEmployeeManagement.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  Search,
  X,
  Edit,
  Trash2,
  ChevronLeft,
  Save,
  User,
  UserCog,
  Clock,
  MapPin,
  Circle,
  ChevronDown,
  ChevronUp,
  Plus,
  Settings,
} from "lucide-react";

// Import the new EmployeeRoleManagement component
import EmployeeRoleManagement from "./EmployeeRoleManagement";

const roles = ["user", "admin", "employee"];
const shifts = ["morning", "night"];
const statuses = ["occupied", "free"];

const AdminEmployeeManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employees");

  const [searchParams, setSearchParams] = useState({
    email: "",
    shift: "",
    workingLocation: "",
  });
  const [users, setUsers] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [updateData, setUpdateData] = useState({
    role: "",
    employeeRole: "",
    shift: "",
    workingLocation: "",
    status: "",
  });
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [branches, setBranches] = useState([]);
  const fetchUsers = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/users?${query}`);
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Could not fetch users");
    }
    setLoading(false);
  };
  const fetchBranches = async () => {
    try {
      const res = await api.get("admin/branches"); // ✅ Yeh API create karni padegi
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  useEffect(() => {
    if (activeTab === "employees") {
      fetchUsers();
      fetchEmployeeRoles();
      fetchBranches(); // ✅ Add this
    }
  }, [activeTab]);
  const fetchEmployeeRoles = async () => {
    try {
      const res = await api.get("/admin/employee-roles");
      setEmployeeRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch employee roles", err);
    }
  };

  useEffect(() => {
    if (activeTab === "employees") {
      fetchUsers();
      fetchEmployeeRoles();
    }
  }, [activeTab]);

  const handleSearchChange = (e) =>
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchParams);
  };

  const handleReset = () => {
    const empty = { email: "", shift: "", workingLocation: "" };
    setSearchParams(empty);
    fetchUsers(empty);
  };

  const startEditUser = (user) => {
    setEditingUser(user);
    setUpdateData({
      role: user.role,
      employeeRole: user.employeeRole,
      shift: user.shift,
      workingLocation: user.workingLocation,
      status: user.status,
    });
  };

  const handleUpdateChange = (e) =>
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/admin/users/${editingUser._id}`, updateData);
      setUsers((u) =>
        u.map((x) => (x._id === editingUser._id ? res.data.user : x))
      );
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
    setLoading(false);
  };

  // Live stats

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      free: { color: "bg-green-100 text-green-800", text: "Available" },
      occupied: { color: "bg-yellow-100 text-yellow-800", text: "Busy" },
      default: {
        color: "bg-gray-100 text-gray-800",
        text: status || "Unknown",
      },
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Circle className="w-2 h-2 mr-1" />
        {config.text}
      </span>
    );
  };

  const tabs = [
    { id: "employees", label: "Employee Management", icon: Users },
    { id: "roles", label: "Employee Roles", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <UserCog className="mr-3 h-8 w-8 text-indigo-600" />
          Employee Management
        </h1>
      </div>

      {/* Tab Navigation */}
      <nav className="flex mb-6 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 -mb-px border-b-2 ${
              activeTab === id
                ? "border-indigo-500 text-indigo-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      {activeTab === "employees" && (
        <>
          {/* Stats Cards */}

          {/* Filters Section */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-1">
              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="w-full flex items-center justify-between p-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-indigo-600" />
                  <span className="font-medium">Search Filters</span>
                </div>
                {expandedFilters ? <ChevronUp /> : <ChevronDown />}
              </button>

              {expandedFilters && (
                <form
                  onSubmit={handleSearch}
                  className="p-4 pt-2 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          name="email"
                          value={searchParams.email}
                          onChange={handleSearchChange}
                          placeholder="Search by email"
                          className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shift
                      </label>
                      <div className="relative">
                        <select
                          name="shift"
                          value={searchParams.shift}
                          onChange={handleSearchChange}
                          className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Shifts</option>
                          {shifts.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <select
                          name="workingLocation"
                          value={searchParams.workingLocation}
                          onChange={handleSearchChange}
                          className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">All Locations</option>
                          {branches.map((branch) => (
                            <option key={branch._id} value={branch.name}>
                              {branch.name} {/* Gold, Diamond, Silver */}
                            </option>
                          ))}
                        </select>
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={handleReset}
                      disabled={loading}
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="flex items-center"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>

          {/* Users Table */}
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-800">
                Employee Directory
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage all users and their permissions
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Emp Role",
                      "Shift",
                      "Location",
                      "Status",
                      "Emp ID",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                        <p className="mt-2 text-gray-600">
                          Loading employee data...
                        </p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <User className="h-12 w-12 text-gray-400 mb-3" />
                          <h4 className="text-lg font-medium text-gray-700">
                            No employees found
                          </h4>
                          <p className="mt-1 text-gray-500">
                            Try adjusting your search filters
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gray-100 border-2 border-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="font-medium text-gray-900">
                              {u.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 ">
                          {u.employeeRole || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 capitalize">
                          {u.shift || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {u.workingLocation || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={u.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                          {u.employeeId || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button
                              variant="icon"
                              onClick={() => startEditUser(u)}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="icon"
                              onClick={() => handleDelete(u._id)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <Card className="w-full max-w-lg bg-white border border-gray-200 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    Edit {editingUser.name}
                  </h3>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="p-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        User Role
                      </label>
                      <div className="relative">
                        <select
                          name="role"
                          value={updateData.role}
                          onChange={handleUpdateChange}
                          className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                        <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {updateData.role === "employee" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Employee Role
                          </label>
                          <div className="relative">
                            <select
                              name="employeeRole"
                              value={updateData.employeeRole}
                              onChange={handleUpdateChange}
                              className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Role</option>
                              {employeeRoles.map((r) => (
                                <option key={r._id} value={r.name}>
                                  {r.name}{" "}
                                </option>
                              ))}
                            </select>
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Shift
                          </label>
                          <div className="relative">
                            <select
                              name="shift"
                              value={updateData.shift}
                              onChange={handleUpdateChange}
                              className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Shift</option>
                              {shifts.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        // Line ~381 - Edit modal ke workingLocation field ko
                        update karo
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Working Location
                          </label>
                          <div className="relative">
                            <select
                              name="workingLocation"
                              value={updateData.workingLocation}
                              onChange={handleUpdateChange}
                              className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Branch</option>
                              {branches.map((branch) => (
                                <option key={branch._id} value={branch.name}>
                                  {branch.name} ({branch.address}){" "}
                                  {/* Optional: address show karo */}
                                </option>
                              ))}
                            </select>
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <div className="relative">
                            <select
                              name="status"
                              value={updateData.status}
                              onChange={handleUpdateChange}
                              className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 pl-10 text-gray-700 appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Status</option>
                              {statuses.map((st) => (
                                <option key={st} value={st}>
                                  {st.charAt(0).toUpperCase() + st.slice(1)}
                                </option>
                              ))}
                            </select>
                            <Circle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingUser(null)}
                      className="px-5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="px-5 flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Employee Roles Tab */}
      {activeTab === "roles" && <EmployeeRoleManagement />}
    </div>
  );
};

export default AdminEmployeeManagement;
