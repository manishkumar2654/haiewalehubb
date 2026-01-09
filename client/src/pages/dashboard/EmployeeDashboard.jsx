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
} from "lucide-react";
import api from "../../services/api";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    revenue: 0,
  });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = user?._id || user?.id;

        if (!userId) {
          setError("User not properly authenticated");
          setLoading(false);
          return;
        }

        const res = await api.get(
          `/appointments/employees/${userId}/appointments?timeRange=${timeRange}`
        );

        setAppointments(res.data);
        setFilteredAppointments(res.data);

        // Calculate comprehensive stats
        const completed = res.data.filter(
          (a) => a.status === "Completed"
        ).length;
        const upcoming = res.data.filter(
          (a) => a.status === "Confirmed" || a.status === "In Progress"
        ).length;
        const cancelled = res.data.filter(
          (a) => a.status === "Cancelled"
        ).length;
        const revenue = res.data
          .filter((a) => a.status === "Completed")
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

        setStats({
          total: res.data.length,
          completed,
          upcoming,
          cancelled,
          revenue,
        });
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, timeRange]);

  useEffect(() => {
    let filtered = appointments;

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          (app.userId?.name || "Walk-in Customer")
            ?.toLowerCase()
            .includes(term) ||
          (app.serviceId?.name || "General Service")
            ?.toLowerCase()
            .includes(term) ||
          app.appointmentId?.toLowerCase().includes(term) ||
          app.roomId?.roomNumber?.toLowerCase().includes(term)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, searchTerm]);

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(appointmentId);
      const response = await api.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      if (response.data.appointment) {
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === appointmentId ? response.data.appointment : app
          )
        );
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Complete appointment
  const completeAppointment = async (appointmentId) => {
    try {
      setUpdatingStatus(appointmentId);
      const response = await api.put(`/appointments/${appointmentId}/complete`);

      if (response.data.message) {
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === appointmentId ? { ...app, status: "Completed" } : app
          )
        );
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert("Failed to complete appointment");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Helper functions
  const getClientName = (appointment) => {
    return appointment.userId?.name || "Walk-in Customer";
  };

  const getServiceName = (appointment) => {
    return appointment.serviceId?.name || "General Service";
  };

  const getServiceDescription = (appointment) => {
    return appointment.serviceId?.description || "Professional spa service";
  };

  const getFormattedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFormattedTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / 60000);
    return `${durationMinutes} min`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
        };
      case "Confirmed":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      case "In Progress":
        return {
          bg: "bg-amber-100",
          text: "text-amber-800",
          border: "border-amber-200",
        };
      case "Pending":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
      case "Cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  const getStatusUpdateOptions = (currentStatus) => {
    const options = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["In Progress", "Cancelled"],
      "In Progress": ["Completed", "Cancelled"],
      Completed: [],
      Cancelled: ["Confirmed"],
    };
    return options[currentStatus] || [];
  };

  // Stat cards configuration
  const statCards = [
    {
      name: "Total Appointments",
      value: stats.total,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "All assigned appointments",
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
      name: "Upcoming",
      value: stats.upcoming,
      icon: CalendarIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      description: "Scheduled appointments",
    },
    {
      name: "Revenue",
      value: `₹${stats.revenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      description: "Total earnings",
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

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
                    Employee Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome back,{" "}
                    <span className="font-semibold text-rose-600">
                      {user?.name}
                    </span>
                    ! Here's your work overview.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <Briefcase className="h-3 w-3" />
                  <span className="font-medium capitalize">
                    {user?.employeeRole}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium capitalize">
                    {user?.workingLocation}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">
                    {stats.total} Appointments
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
                {["upcoming", "past", "all"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium capitalize rounded-md transition-all duration-200 ${
                      timeRange === range
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {range}
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
                Filter Appointments
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
                      placeholder="Search clients, services, rooms..."
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

        {/* Appointments Section */}
        <Card>
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-rose-600" />
                  Your Appointments
                  <span className="bg-rose-100 text-rose-800 text-sm font-medium px-2 py-1 rounded-full">
                    {filteredAppointments.length}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || statusFilter !== "all"
                    ? `Showing ${filteredAppointments.length} filtered appointments`
                    : `All your ${timeRange} appointments`}
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
                <p className="text-gray-600">Loading your appointments...</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please wait a moment
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load Appointments
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="grid gap-4">
                {filteredAppointments.map((appointment) => {
                  const statusColors = getStatusColor(appointment.status);
                  const updateOptions = getStatusUpdateOptions(
                    appointment.status
                  );

                  return (
                    <div
                      key={appointment._id}
                      className={`bg-white rounded-xl border-2 ${statusColors.border} p-5 hover:shadow-lg transition-all duration-300 group`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        {/* Appointment Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-rose-50 p-2 rounded-lg">
                                <Scissors className="h-5 w-5 text-rose-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                  {getServiceName(appointment)}
                                </h3>
                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                  {getServiceDescription(appointment)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                              >
                                {appointment.status}
                              </span>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Appointment ID
                                </p>
                                <p className="text-sm font-mono font-semibold text-gray-900">
                                  {appointment.appointmentId}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <User className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Client</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {getClientName(appointment)}
                                </p>
                                {appointment.userId?.phone && (
                                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3" />
                                    {appointment.userId.phone}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Date & Time
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {getFormattedDate(
                                    appointment.appointmentDateTime
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {getFormattedTime(
                                    appointment.appointmentDateTime
                                  )}{" "}
                                  •{" "}
                                  {getDuration(
                                    appointment.appointmentDateTime,
                                    appointment.endDateTime
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Building className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Room</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {appointment.roomId?.roomNumber}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {appointment.roomId?.type} •{" "}
                                  {appointment.roomId?.location}
                                </p>
                              </div>
                            </div>

                            {appointment.totalPrice && (
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-xs text-green-600">
                                    Total Amount
                                  </p>
                                  <p className="text-sm font-bold text-green-700">
                                    ₹{appointment.totalPrice.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-green-500">
                                    {appointment.paymentStatus === "Paid"
                                      ? "Paid"
                                      : "Pending"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {updateOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateAppointmentStatus(appointment._id, status)
                              }
                              disabled={updatingStatus === appointment._id}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              {updatingStatus === appointment._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3" />
                                  Mark as {status}
                                </>
                              )}
                            </button>
                          ))}

                          {appointment.status === "In Progress" && (
                            <button
                              onClick={() =>
                                completeAppointment(appointment._id)
                              }
                              disabled={updatingStatus === appointment._id}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </button>
                          )}

                          {appointment.status === "Completed" && (
                            <div className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-green-100 text-green-800 rounded-lg border border-green-200">
                              <Star className="h-3 w-3" />
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
                  <CalendarIcon className="h-10 w-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Appointments Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "No appointments match your current filters. Try adjusting your search criteria."
                    : `You don't have any ${
                        timeRange === "upcoming" ? "upcoming" : timeRange
                      } appointments scheduled.`}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
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
        {!loading && appointments.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredAppointments.length} of {appointments.length}{" "}
              appointments • Last updated:{" "}
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
