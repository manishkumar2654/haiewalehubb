import React from "react";
import {
  Calendar,
  Clock,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Eye,
  Sparkles,
  Crown,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Clock4,
  CalendarDays,
} from "lucide-react";

const AppointmentList = ({
  appointments = [],
  showUser = false,
  showEmployee = false,
  onAppointmentClick,
  showRoom = false,
  showPrice = false,
  variant = "card", // "card" or "table"
}) => {
  // Helper functions
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
          label: "Completed",
        };
      case "Confirmed":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: Star,
          label: "Confirmed",
        };
      case "In Progress":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: Zap,
          label: "In Progress",
        };
      case "Pending":
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: Clock4,
          label: "Pending",
        };
      case "Cancelled":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: XCircle,
          label: "Cancelled",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: Clock4,
          label: status,
        };
    }
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
    if (!start || !end) return "N/A";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / 60000);
    return `${durationMinutes} min`;
  };

  // Card View (Default)
  if (variant === "card") {
    return (
      <div className="grid gap-4 md:gap-6">
        {appointments.map((appt) => {
          const statusConfig = getStatusConfig(appt.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={appt._id}
              className={`bg-white rounded-2xl border-2 ${statusConfig.borderColor} p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1`}
              onClick={() => onAppointmentClick && onAppointmentClick(appt)}
            >
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-rose-500 to-amber-500 p-3 rounded-xl shadow-sm">
                    <CalendarDays className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 font-[philosopher] group-hover:text-rose-700 transition-colors">
                          {appt.serviceId?.name ||
                            appt.service?.name ||
                            "General Service"}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {appt.serviceId?.description ||
                            "Professional spa service"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">
                            Appointment ID
                          </p>
                          <p className="text-sm font-mono font-bold text-gray-900">
                            {appt.appointmentId}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Date & Time */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Calendar className="h-4 w-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Date & Time
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getFormattedDate(appt.appointmentDateTime)}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getFormattedTime(appt.appointmentDateTime)} •{" "}
                      {getDuration(appt.appointmentDateTime, appt.endDateTime)}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                {showUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Customer
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appt.userId?.name ||
                          appt.user?.name ||
                          "Walk-in Customer"}
                      </p>
                      {(appt.userId?.phone || appt.userId?.email) && (
                        <div className="flex flex-col gap-0.5 mt-1">
                          {appt.userId?.phone && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appt.userId.phone}
                            </p>
                          )}
                          {appt.userId?.email && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {appt.userId.email}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Employee */}
                {showEmployee && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Briefcase className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">
                        Assigned To
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appt.employeeId?.name ||
                          appt.employee?.name ||
                          "Not Assigned"}
                      </p>
                      {appt.employeeId?.employeeRole && (
                        <p className="text-xs text-gray-400 capitalize">
                          {appt.employeeId.employeeRole}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Room */}
                {showRoom && appt.roomId && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Room</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appt.roomId.roomNumber}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {appt.roomId.type} • {appt.roomId.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Price */}
                {showPrice && appt.totalPrice && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-green-200">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">
                        Total Amount
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        ₹{appt.totalPrice.toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          appt.paymentStatus === "Paid"
                            ? "text-green-500"
                            : "text-amber-500"
                        }`}
                      >
                        {appt.paymentStatus === "Paid"
                          ? "Paid"
                          : "Payment Pending"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>
                    Created on {new Date(appt.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick && onAppointmentClick(appt);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-lg hover:from-rose-600 hover:to-amber-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium group/btn"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                  <Zap className="h-3 w-3 transform group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-rose-50 to-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
              <Calendar className="h-10 w-10 text-rose-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[philosopher]">
              No Appointments Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no appointments to display at the moment.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Table View (Fallback)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Service
              </th>
              {showUser && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
              )}
              {showEmployee && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appt) => {
              const statusConfig = getStatusConfig(appt.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr
                  key={appt._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onAppointmentClick && onAppointmentClick(appt)}
                >
                  {/* Service */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-50 p-2 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-rose-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {appt.serviceId?.name || appt.service?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {appt.appointmentId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  {showUser && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appt.userId?.name || appt.user?.name || "-"}
                          </div>
                          {appt.userId?.phone && (
                            <div className="text-xs text-gray-500">
                              {appt.userId.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Employee */}
                  {showEmployee && (
                    <td className="px-6 py-4">
                      {appt.employeeId || appt.employee ? (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {appt.employeeId?.name ||
                              appt.employee?.name ||
                              "-"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Not Assigned
                        </span>
                      )}
                    </td>
                  )}

                  {/* Date & Time */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {getFormattedDate(appt.appointmentDateTime)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getFormattedTime(appt.appointmentDateTime)}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick && onAppointmentClick(appt);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}

            {appointments.length === 0 && (
              <tr>
                <td
                  colSpan={4 + (showUser ? 1 : 0) + (showEmployee ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Appointments Found
                    </h3>
                    <p className="text-gray-500">
                      There are no appointments to display.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;
