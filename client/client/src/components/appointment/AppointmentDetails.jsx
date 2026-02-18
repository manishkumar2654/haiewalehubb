import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import {
  UserPlus,
  Clock,
  MapPin,
  User,
  CreditCard,
  Calendar,
  Info,
  Crown,
  Sparkles,
  Building,
  Home,
  Phone,
  Globe,
} from "lucide-react";

const AppointmentDetails = ({
  appointment,
  adminView = false,
  onClose,
  onStatusUpdate,
  onPaymentStatusUpdate,
  onCompleteAppointment,
  statusOptions = [],
  paymentStatusOptions = [],
  showAssignButton = false,
  onAssignEmployee,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [completing, setCompleting] = useState(false);

  console.log("🔍 Appointment Data:", appointment);
  console.log("🔍 Created By:", appointment.createdBy);
  console.log("🔍 User ID:", appointment.userId);
  console.log("🔍 FULL APPOINTMENT:", appointment);
  console.log("🔍 ROOM:", appointment?.roomId);
  console.log("🔍 BRANCH:", appointment?.roomId?.branch);
  console.log("🔍 Branch name:", appointment?.roomId?.branch?.name);
  console.log("🔍 Branch address:", appointment?.roomId?.branch?.address);
  const formatDateTime = (dateString) => {
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
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  useEffect(() => {
    // Check if appointment has nested structure
    let actualAppointment = appointment;

    if (appointment && appointment.appointment) {
      actualAppointment = appointment.appointment;
      console.log("✅ Found nested appointment structure");
    }

    console.log("🔍 Actual appointment:", actualAppointment);
    console.log("🔍 Branch:", actualAppointment?.roomId?.branch);

    if (actualAppointment?.roomId?.branch) {
      console.log("✅ Branch found:", actualAppointment.roomId.branch.name);
    }
  }, [appointment]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Refunded":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Cash":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(appointment._id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    setUpdatingPaymentStatus(true);
    try {
      await onPaymentStatusUpdate(appointment._id, newPaymentStatus);
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onCompleteAppointment(appointment._id);
    } finally {
      setCompleting(false);
    }
  };
  const getAppointmentData = () => {
    // If appointment has nested appointment property
    if (appointment && appointment.appointment) {
      return appointment.appointment;
    }
    return appointment;
  };

  const appointmentData = getAppointmentData();

  // Then use appointmentData everywhere instead of appointment
  console.log("🔍 Processed appointment:", appointmentData);
  console.log("🔍 Branch data:", appointmentData?.roomId?.branch);
  // Get duration from service pricing or appointment data
  const getDuration = () => {
    if (appointment.serviceId?.pricing?.[0]?.durationMinutes) {
      return `${appointment.serviceId.pricing[0].durationMinutes} minutes`;
    }

    // Calculate duration from start and end times if not available in pricing
    if (appointment.appointmentDateTime && appointment.endDateTime) {
      const start = new Date(appointment.appointmentDateTime);
      const end = new Date(appointment.endDateTime);
      const durationMs = end - start;
      const durationMinutes = Math.floor(durationMs / 60000);
      return `${durationMinutes} minutes`;
    }

    return "N/A";
  };

  // Check if room has branch details
  const hasBranchDetails =
    appointment?.roomId?.branch &&
    Object.keys(appointment.roomId.branch).length > 0;

  return (
    <div className="space-y-6">
      {/* Header - Improved Design */}
      <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-6 rounded-xl border border-rose-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Sparkles className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-[philosopher]">
                  Appointment #{appointment.appointmentId}
                </h2>
                <p className="text-sm text-gray-600 font-[poppins]">
                  Created on {formatDateTime(appointment.createdAt)}
                </p>
              </div>
            </div>

            {/* Created By Section */}
            {appointment.createdBy && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-white/80 rounded-lg border border-rose-100">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">
                  Booked by:{" "}
                  <span className="text-black-700">
                    {appointment.createdBy.name}
                    {appointment.createdBy.employeeRole && (
                      <span className="text-amber-600 ml-1">
                        ({appointment.createdBy.employeeRole})
                      </span>
                    )}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span
              className={`px-3 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status}
            </span>
            <span
              className={`px-3 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                appointment.paymentStatus
              )}`}
            >
              {appointment.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Service Details - Improved Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <div className="bg-rose-100 p-2 rounded-lg mr-3">
            <Info className="h-5 w-5 text-rose-600" />
          </div>
          Service Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Service</p>
            <p className="font-semibold text-gray-900 text-lg">
              {appointment.serviceId?.name || "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="font-semibold text-gray-900">
              {appointment.serviceId?.category?.name || "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="font-semibold text-gray-900">{getDuration()}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Service Price</p>
            <p className="font-semibold text-rose-600 text-lg">
              {formatCurrency(
                appointment.servicePrice ||
                  appointment.serviceId?.pricing?.[0]?.price ||
                  0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Date & Time - Improved Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          Timing Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Date</p>
            <p className="font-semibold text-gray-900 text-lg">
              {new Date(appointment.appointmentDateTime).toLocaleDateString(
                "en-IN",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Time Slot</p>
            <p className="font-semibold text-gray-900 text-lg">
              {formatTime(appointment.appointmentDateTime)} -{" "}
              {formatTime(appointment.endDateTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Room & Branch Details - IMPROVED with Branch Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <div className="bg-emerald-100 p-2 rounded-lg mr-3">
            <Building className="h-5 w-5 text-emerald-600" />
          </div>
          Room & Branch Details
        </h3>

        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center">
            <Home className="h-4 w-4 text-gray-600 mr-2" />
            Room Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Room Number</p>
              <p className="font-semibold text-gray-900 text-lg">
                {appointment.roomId?.roomNumber || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Room Type</p>
              <p className="font-semibold text-gray-900">
                {appointment.roomId?.type || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Capacity</p>
              <p className="font-semibold text-gray-900">
                {appointment.roomId?.capacity
                  ? `${appointment.roomId.capacity} person${
                      appointment.roomId.capacity > 1 ? "s" : ""
                    }`
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Room Price</p>
              <p className="font-semibold text-rose-600 text-lg">
                {formatCurrency(appointment.roomPrice || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Branch Details Section */}
        {appointment?.roomId?.branch ? (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center">
              <Building className="h-4 w-4 text-gray-600 mr-2" />
              Branch Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Branch Name</p>
                <p className="font-semibold text-gray-900">
                  {appointment.roomId.branch.name}
                  <span className="block text-xs text-gray-500 mt-1">
                    Type: {appointment.roomId.branch.name}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {appointment.roomId.branch.address}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    <Phone className="inline h-3 w-3 mr-1" />
                    {appointment.roomId.branch.phone}
                  </p>
                  {appointment.roomId.branch.landline && (
                    <p className="text-sm text-gray-600">
                      Landline: {appointment.roomId.branch.landline}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">
                  Working Hours
                </p>
                <p className="font-semibold text-gray-900">
                  {appointment.roomId.branch.workingHours ||
                    "9:00 AM - 9:00 PM"}
                  {appointment.roomId.branch.premium && (
                    <span className="block text-xs text-amber-600 mt-1">
                      ⭐ Premium Branch
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 flex items-center">
                <Globe className="h-4 w-4 mr-2 text-gray-500" />
                No specific branch assigned. Service will be conducted in the
                standard treatment area.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details - Improved Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <div className="bg-purple-100 p-2 rounded-lg mr-3">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          Customer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="font-semibold text-gray-900 text-lg">
              {appointment.userId?.name || "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="font-semibold text-gray-900">
              {appointment.userId?.email || "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="font-semibold text-gray-900">
              {appointment.userId?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Details - Improved Card */}
      {appointment.employeeId && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
            <div className="bg-amber-100 p-2 rounded-lg mr-3">
              <UserPlus className="h-5 w-5 text-amber-600" />
            </div>
            Assigned Employee
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">
                {appointment.employeeId?.name || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="font-semibold text-gray-900">
                {appointment.employeeId?.employeeId || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="font-semibold text-gray-900">
                {appointment.employeeId?.employeeRole || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">
                Working Branch
              </p>
              <p className="font-semibold text-gray-900">
                {appointment.employeeId?.workingLocation || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details - Improved Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          Payment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Payment Method</p>
            <p className="font-semibold text-gray-900 capitalize">
              {appointment.paymentMethod || "N/A"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Service Price</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(appointment.servicePrice || 0)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Room Price</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(appointment.roomPrice || 0)}
            </p>
          </div>
          <div className="space-y-2 bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm font-medium text-gray-700">Total Amount</p>
            <p className="font-bold text-2xl text-rose-700">
              {formatCurrency(appointment.totalPrice || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Actions - Improved Design */}
      {adminView && (
        <div className="mt-8 pt-8 border-t border-gray-200 bg-gray-50 p-6 rounded-xl">
          <h4 className="text-xl font-bold text-gray-900 mb-6 font-[philosopher]">
            Admin Actions
          </h4>

          {showAssignButton && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Button
                onClick={onAssignEmployee}
                className="flex items-center bg-amber-600 hover:bg-amber-700"
                variant="primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Employee
              </Button>
              <p className="text-sm text-amber-700 mt-2">
                This appointment needs an employee assigned. Click to select
                from available staff.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-gray-700"
              >
                Update Status
              </label>
              <select
                id="status"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                value={appointment.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="paymentStatus"
                className="block text-sm font-semibold text-gray-700"
              >
                Update Payment Status
              </label>
              <select
                id="paymentStatus"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                value={appointment.paymentStatus}
                onChange={(e) => handlePaymentStatusChange(e.target.value)}
                disabled={updatingPaymentStatus}
              >
                {paymentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {appointment.status === "In Progress" && (
            <Button
              onClick={handleComplete}
              disabled={completing}
              variant="success"
              className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              {completing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </span>
              ) : (
                "Complete Appointment"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentDetails;
