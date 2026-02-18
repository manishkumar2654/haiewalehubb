import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/ui/Card";
import {
  Clock,
  MapPin,
  Briefcase,
  CheckCircle,
  Calendar as CalendarIcon,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Scissors,
  DollarSign,
  Phone,
  Mail,
  Building,
  Sparkles,
  Crown,
  Star,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Package,
  QrCode,
  Download,
  Eye,
  Edit,
} from "lucide-react";
import api from "../../services/api";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [walkins, setWalkins] = useState([]);
  const [filteredWalkins, setFilteredWalkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    confirmed: 0,
    revenue: 0,
  });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [selectedWalkin, setSelectedWalkin] = useState(null);

  useEffect(() => {
    const fetchEmployeeWalkins = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = user?._id || user?.id;

        if (!userId) {
          setError("User not properly authenticated");
          setLoading(false);
          return;
        }

        // Fetch walkins assigned to this employee
        const res = await api.get(`/walkins/employee/${userId}`);

        // Check if response is valid and has data array
        if (!res.data || !res.data.success) {
          setError("Failed to fetch walkins");
          setWalkins([]);
          return;
        }

        // Get the walkins array from response
        const allWalkins = res.data.data || [];

        // Filter to show only walkins where this employee is assigned to services
        const employeeWalkins = Array.isArray(allWalkins)
          ? allWalkins.filter((walkin) => {
              if (!walkin || !walkin.services) return false;
              return walkin.services.some(
                (service) =>
                  service.staff &&
                  (service.staff._id === userId ||
                    service.staff._id?.toString() === userId?.toString() ||
                    service.staff === userId)
              );
            })
          : [];

        console.log("Employee walkins:", employeeWalkins);
        console.log("User ID:", userId);

        setWalkins(employeeWalkins);
        setFilteredWalkins(employeeWalkins);

        // Calculate comprehensive stats
        const completed = employeeWalkins.filter(
          (w) => w.status === "completed"
        ).length;
        const in_progress = employeeWalkins.filter(
          (w) => w.status === "in_progress"
        ).length;
        const confirmed = employeeWalkins.filter(
          (w) => w.status === "confirmed"
        ).length;
        const revenue = employeeWalkins
          .filter((w) => w.status === "completed")
          .reduce((sum, w) => sum + (w.totalAmount || 0), 0);

        setStats({
          total: employeeWalkins.length,
          completed,
          in_progress,
          confirmed,
          revenue,
        });
      } catch (error) {
        console.error("Error fetching employee walkins:", error);
        setError(`Failed to load your assigned walkins: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployeeWalkins();
    }
  }, [user]);

  useEffect(() => {
    let filtered = walkins;

    // Filter by time range
    const now = new Date();
    if (timeRange === "today") {
      filtered = filtered.filter((w) => {
        const walkinDate = new Date(w.walkinDate || w.createdAt);
        return walkinDate.toDateString() === now.toDateString();
      });
    } else if (timeRange === "this_week") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const today = new Date();
      filtered = filtered.filter((w) => {
        const walkinDate = new Date(w.walkinDate || w.createdAt);
        return walkinDate >= startOfWeek && walkinDate <= today;
      });
    } else if (timeRange === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const today = new Date();
      filtered = filtered.filter((w) => {
        const walkinDate = new Date(w.walkinDate || w.createdAt);
        return walkinDate >= startOfMonth && walkinDate <= today;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.customerName?.toLowerCase().includes(term) ||
          w.customerPhone?.toLowerCase().includes(term) ||
          w.walkinNumber?.toLowerCase().includes(term) ||
          w.branch?.toLowerCase().includes(term)
      );
    }

    setFilteredWalkins(filtered);
  }, [walkins, timeRange, statusFilter, searchTerm]);

  // Update walkin status
  const updateWalkinStatus = async (walkinId, newStatus) => {
    try {
      setUpdatingStatus(walkinId);
      const response = await api.put(`/walkins/${walkinId}/status`, {
        status: newStatus,
      });

      if (response.data && response.data.success && response.data.data) {
        setWalkins((prev) =>
          prev.map((w) => (w._id === walkinId ? response.data.data : w))
        );
        alert(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating walkin status:", error);
      alert("Failed to update walkin status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update service status
  const updateServiceStatus = async (walkinId, serviceIndex, isCompleted) => {
    try {
      // You can implement this based on your backend API
      alert("Service status update feature to be implemented");
    } catch (error) {
      console.error("Error updating service status:", error);
    }
  };

  // Get assigned services for current employee in a walkin
  const getAssignedServices = (walkin) => {
    if (!user || !walkin || !walkin.services) return [];
    const userId = user._id || user.id;

    return walkin.services.filter((service) => {
      if (!service) return false;
      if (service.staff && typeof service.staff === "object") {
        return (
          service.staff._id === userId ||
          service.staff._id?.toString() === userId?.toString()
        );
      } else if (typeof service.staff === "string") {
        return service.staff === userId;
      }
      return false;
    });
  };

  // Helper functions
  const getFormattedDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getFormattedTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid Time";
    }
  };

  const getStatusColor = (status) => {
    if (!status)
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200",
        icon: "•",
      };

    switch (status.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          icon: "✓",
        };
      case "confirmed":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          icon: "✓",
        };
      case "in_progress":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
          icon: "⏳",
        };
      case "draft":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "📝",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          icon: "✗",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "•",
        };
    }
  };

  const getStatusUpdateOptions = (currentStatus) => {
    if (!currentStatus) return [];

    switch (currentStatus.toLowerCase()) {
      case "draft":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["in_progress", "cancelled"];
      case "in_progress":
        return ["completed", "cancelled"];
      case "completed":
        return [];
      case "cancelled":
        return ["confirmed"];
      default:
        return [];
    }
  };

  // Calculate total services price for assigned services
  const calculateAssignedServicesTotal = (walkin) => {
    const assignedServices = getAssignedServices(walkin);
    return assignedServices.reduce((sum, service) => {
      const price = parseFloat(service.price) || 0;
      return sum + price;
    }, 0);
  };

  // Stat cards configuration
  const statCards = [
    {
      name: "Total Assigned",
      value: stats.total,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Walkins assigned to you",
    },
    {
      name: "In Progress",
      value: stats.in_progress,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      description: "Currently working on",
    },
    {
      name: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Successfully completed",
    },
    {
      name: "Your Earnings",
      value: `₹${stats.revenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "From completed walkins",
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "draft", label: "Draft" },
  ];

  const timeRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  // If no walkins are assigned, show empty state early
  if (!loading && walkins.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100">
                    <Crown className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[philosopher]">
                      My Assigned Walkins
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Welcome,{" "}
                      <span className="font-semibold text-rose-600">
                        {user?.name}
                      </span>
                      ! Manage your assigned walkins here.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                    <Briefcase className="h-3 w-3" />
                    <span className="font-medium capitalize">
                      {user?.employeeRole || "Employee"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium capitalize">
                      {user?.workingLocation || "Branch"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">0 Walkins Assigned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <Card className="text-center py-16">
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
              <FileText className="h-10 w-10 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Walkins Assigned Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have any walkins assigned to you at the moment. Walkins
              will appear here when a customer is assigned to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
              >
                Refresh
              </button>
              <button
                onClick={() => window.open("/admin/walkins", "_blank")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Walkins
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[philosopher]">
                    My Assigned Walkins
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome,{" "}
                    <span className="font-semibold text-rose-600">
                      {user?.name}
                    </span>
                    ! Manage your assigned walkins here.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <Briefcase className="h-3 w-3" />
                  <span className="font-medium capitalize">
                    {user?.employeeRole || "Employee"}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium capitalize">
                    {user?.workingLocation || "Branch"}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">
                    {stats.total} Walkins Assigned
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <div className="flex bg-white rounded-lg border border-gray-300 p-1 shadow-sm">
                {timeRangeOptions.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1 text-sm font-medium capitalize rounded-md transition-all duration-200 ${
                      timeRange === range.value
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={stat.name}
              className={`overflow-hidden border-l-4 ${stat.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center p-5">
                <div
                  className={`flex-shrink-0 p-3 rounded-xl ${stat.bgColor} ${stat.color} shadow-sm`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </dd>
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                {index === 0 && stats.total > 0 && (
                  <div className="flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6 animate-slideDown">
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                Filter Walkins
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search customer name, phone, walkin #..."
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 py-2.5 text-sm transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 py-2.5 text-sm transition-all duration-200"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTimeRange("all");
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Walkins Section */}
        <Card>
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-600" />
                  My Assigned Walkins
                  <span className="bg-rose-100 text-rose-800 text-sm font-medium px-2 py-1 rounded-full">
                    {filteredWalkins.length}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || statusFilter !== "all" || timeRange !== "all"
                    ? `Showing ${filteredWalkins.length} filtered walkins`
                    : `Your walkins for ${
                        timeRange === "today" ? "today" : timeRange
                      }`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>In Progress</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
                <p className="text-gray-600">Loading your walkins...</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please wait a moment
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load Walkins
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            ) : filteredWalkins.length > 0 ? (
              <div className="grid gap-4">
                {filteredWalkins.map((walkin) => {
                  const statusColors = getStatusColor(walkin.status);
                  const updateOptions = getStatusUpdateOptions(walkin.status);
                  const assignedServices = getAssignedServices(walkin);
                  const assignedServicesTotal =
                    calculateAssignedServicesTotal(walkin);

                  return (
                    <div
                      key={walkin._id}
                      className={`bg-white rounded-xl border-2 ${statusColors.border} p-5 hover:shadow-lg transition-all duration-300 group`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Walkin Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-rose-50 p-2 rounded-lg">
                                <FileText className="h-5 w-5 text-rose-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                    {walkin.customerName || "Customer"}
                                  </h3>
                                  {walkin.customerPhone && (
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                      {walkin.customerPhone}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mt-1">
                                  Walkin #: {walkin.walkinNumber || "N/A"} •
                                  Branch: {walkin.branch || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                              >
                                {statusColors.icon}{" "}
                                {walkin.status
                                  ? walkin.status
                                      .replace("_", " ")
                                      .toUpperCase()
                                  : "UNKNOWN"}
                              </span>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Total Amount
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{(walkin.totalAmount || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Walkin Date
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {getFormattedDate(
                                    walkin.walkinDate || walkin.createdAt
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {getFormattedTime(
                                    walkin.walkinDate || walkin.createdAt
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <User className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-blue-600">
                                  Your Services
                                </p>
                                <p className="text-sm font-semibold text-blue-700">
                                  {assignedServices.length} Services
                                </p>
                                <p className="text-xs text-blue-500">
                                  ₹{assignedServicesTotal.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-xs text-green-600">
                                  Payment Status
                                </p>
                                <p
                                  className={`text-sm font-semibold ${
                                    walkin.paymentStatus === "paid"
                                      ? "text-green-700"
                                      : walkin.paymentStatus ===
                                        "partially_paid"
                                      ? "text-amber-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {walkin.paymentStatus
                                    ? walkin.paymentStatus
                                        .replace("_", " ")
                                        .toUpperCase()
                                    : "PENDING"}
                                </p>
                                <p className="text-xs text-green-500">
                                  Paid: ₹
                                  {(walkin.amountPaid || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <Briefcase className="h-4 w-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-purple-600">
                                  Assigned Services
                                </p>
                                <div className="mt-1 space-y-1">
                                  {assignedServices
                                    .slice(0, 2)
                                    .map((service, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between text-xs"
                                      >
                                        <span className="truncate text-black max-w-[100px]">
                                          {service.service?.name || "Service"}
                                        </span>
                                        <span className="font-semibold text-purple-700">
                                          ₹
                                          {(
                                            service.price || 0
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  {assignedServices.length > 2 && (
                                    <p className="text-xs text-purple-500">
                                      +{assignedServices.length - 2} more
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Assigned Services Details */}
                          {assignedServices.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Scissors className="h-4 w-4" />
                                Your Assigned Services Details:
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {assignedServices.map((service, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-2 bg-white rounded border"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {service.service?.name || "Service"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Duration: {service.duration || 30}{" "}
                                          mins
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                          ₹
                                          {(
                                            service.price || 0
                                          ).toLocaleString()}
                                        </p>
                                        {walkin.status === "in_progress" && (
                                          <button
                                            onClick={() =>
                                              updateServiceStatus(
                                                walkin._id,
                                                index,
                                                true
                                              )
                                            }
                                            className="text-xs text-green-600 hover:text-green-800 font-medium mt-1"
                                          >
                                            Mark Done
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {updateOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateWalkinStatus(walkin._id, status)
                              }
                              disabled={updatingStatus === walkin._id}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {updatingStatus === walkin._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3" />
                                  Mark as {status.replace("_", " ")}
                                </>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
                  <FileText className="h-10 w-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Walkins Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all" || timeRange !== "all"
                    ? "No walkins match your current filters. Try adjusting your search criteria."
                    : "No walkins found for the selected time range."}
                </p>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  timeRange !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTimeRange("all");
                    }}
                    className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Footer Stats */}
        {!loading && walkins.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredWalkins.length} of {walkins.length} walkins
              assigned to you • Last updated:{" "}
              {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
