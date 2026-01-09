import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
  Calendar as CalendarIcon,
  Plus,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Info,
  CreditCard,
  X,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
} from "lucide-react";
import { format } from "date-fns";

// AppointmentCard component
const AppointmentCard = ({ appointment, onViewDetails }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "In Progress":
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case "Pending":
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-rose-100 text-rose-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Refunded":
        return "bg-purple-100 text-purple-800";
      case "Cash":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 font-[poppins]">
              {appointment.appointmentId}
            </h3>
            <p className="text-gray-500 text-sm font-[poppins]">
              Created on{" "}
              {format(
                new Date(appointment.createdAt),
                "MMMM do, yyyy 'at' h:mm a"
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                appointment.status
              )} font-[poppins]`}
            >
              {appointment.status}
            </div>
            <div className="hidden sm:block">
              {getStatusIcon(appointment.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-sm">
            <p className="text-gray-500 font-[poppins]">Service</p>
            <p className="font-medium text-gray-900 font-[poppins]">
              {appointment.serviceId?.name || "Service Name Not Available"}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-gray-500 font-[poppins]">Total Amount</p>
            <p className="font-bold text-rose-700 font-[poppins]">
              {formatCurrency(appointment.totalPrice)}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-gray-500 font-[poppins]">Payment Status</p>
            <p className="font-medium text-gray-900 capitalize font-[poppins]">
              <span
                className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(
                  appointment.paymentStatus
                )}`}
              >
                {appointment.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {appointment.roomId?.location || "Location Not Available"}
            </span>
          </div>
          <button
            onClick={() => onViewDetails(appointment)}
            className="text-rose-700 hover:text-rose-800 font-medium text-sm font-[poppins] transition-colors"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

// AppointmentDetailsModal component
const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Refunded":
        return "bg-purple-100 text-purple-800";
      case "Cash":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDuration = () => {
    if (appointment.appointmentDateTime && appointment.endDateTime) {
      const start = new Date(appointment.appointmentDateTime);
      const end = new Date(appointment.endDateTime);
      const durationMs = end - start;
      const durationMinutes = Math.floor(durationMs / 60000);
      return `${durationMinutes} minutes`;
    }

    if (appointment.serviceId?.durationMinutes) {
      return `${appointment.serviceId.durationMinutes} minutes`;
    }

    return "N/A";
  };

  return (
    <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-white/30">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-[philosopher]">
              Appointment Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-[poppins]">
                  {appointment.appointmentId}
                </h3>
                <p className="text-sm text-gray-500 font-[poppins]">
                  Created on {formatDateTime(appointment.createdAt)}
                </p>
              </div>
              <div className="flex space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )} font-[poppins]`}
                >
                  {appointment.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                    appointment.paymentStatus
                  )} font-[poppins]`}
                >
                  {appointment.paymentStatus}
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center font-[poppins]">
                <Info className="h-5 w-5 mr-2" />
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Service
                  </p>
                  <p className="font-medium font-[poppins]">
                    {appointment.serviceId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Duration
                  </p>
                  <p className="font-medium font-[poppins]">{getDuration()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Service Price
                  </p>
                  <p className="font-medium font-[poppins]">
                    {formatCurrency(appointment.servicePrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center font-[poppins]">
                <Clock className="h-5 w-5 mr-2" />
                Timing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">Date</p>
                  <p className="font-medium font-[poppins]">
                    {appointment.appointmentDateTime
                      ? new Date(
                          appointment.appointmentDateTime
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">Time</p>
                  <p className="font-medium font-[poppins]">
                    {formatTime(appointment.appointmentDateTime)} -{" "}
                    {formatTime(appointment.endDateTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center font-[poppins]">
                <MapPin className="h-5 w-5 mr-2" />
                Room Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Room Number
                  </p>
                  <p className="font-medium font-[poppins]">
                    {appointment.roomId?.roomNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Room Type
                  </p>
                  <p className="font-medium font-[poppins]">
                    {appointment.roomId?.type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Location
                  </p>
                  <p className="font-medium font-[poppins]">
                    {appointment.roomId?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Room Price
                  </p>
                  <p className="font-medium font-[poppins]">
                    {formatCurrency(appointment.roomPrice || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Details */}
            {appointment.employeeId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center font-[poppins]">
                  <User className="h-5 w-5 mr-2" />
                  Assigned Employee
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-[poppins]">Name</p>
                    <p className="font-medium font-[poppins]">
                      {appointment.employeeId?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-[poppins]">
                      Employee ID
                    </p>
                    <p className="font-medium font-[poppins]">
                      {appointment.employeeId?.employeeId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center font-[poppins]">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Payment Method
                  </p>
                  <p className="font-medium font-[poppins]">
                    {appointment.paymentMethod === "online"
                      ? "Online Payment"
                      : "Cash Payment" || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Service Price
                  </p>
                  <p className="font-medium font-[poppins]">
                    {formatCurrency(appointment.servicePrice || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Room Price
                  </p>
                  <p className="font-medium font-[poppins]">
                    {formatCurrency(appointment.roomPrice || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    Total Amount
                  </p>
                  <p className="font-medium text-green-600 font-[poppins]">
                    {formatCurrency(appointment.totalPrice || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main MyAppointments component
const MyAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("upcoming");
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get(
          `/appointments/users/${user._id}/appointments?timeRange=${timeRange}`
        );
        setAppointments(res.data || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user, timeRange]);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const filteredAppointments = appointments
    .filter(
      (appointment) =>
        appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.serviceId?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (appointment.roomId?.location || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((appointment) => {
      if (statusFilter === "all") return true;
      return appointment.status === statusFilter;
    })
    .sort(
      (a, b) =>
        new Date(b.appointmentDateTime || b.createdAt) -
        new Date(a.appointmentDateTime || a.createdAt)
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-[philosopher]">
              Error Loading Appointments
            </h2>
            <p className="text-gray-600 mb-6 font-[poppins]">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center text-rose-700 hover:text-rose-800 mb-4 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
                My Appointments
              </h1>
              <p className="text-gray-600 font-[poppins]">
                View your appointment history and track current appointments
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-sm">
              <CalendarIcon className="h-5 w-5 text-rose-600" />
              <span className="font-medium text-gray-700 font-[poppins]">
                {appointments.length}{" "}
                {appointments.length === 1 ? "Appointment" : "Appointments"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm text-black rounded-2xl shadow-xl p-6 border border-white/30 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-[poppins]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-[poppins]"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Time Range Tabs */}
        <div className="flex space-x-4 overflow-x-auto mb-6">
          {["upcoming", "past", "all"].map((opt) => (
            <button
              key={opt}
              onClick={() => setTimeRange(opt)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition font-[poppins]
                ${
                  timeRange === opt
                    ? "bg-gradient-to-r from-rose-700 to-amber-700 text-white"
                    : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/30 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2 font-[philosopher]">
              {appointments.length === 0
                ? "No appointments yet"
                : "No appointments match your search"}
            </h3>
            <p className="text-gray-500 mb-6 font-[poppins]">
              {appointments.length === 0
                ? "Book an appointment to see them here"
                : "Try adjusting your search or filter criteria"}
            </p>
            {appointments.length === 0 && (
              <button
                onClick={() => navigate("/appointment")}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
