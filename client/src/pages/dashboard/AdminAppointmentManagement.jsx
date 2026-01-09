import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  UserPlus,
  Plus,
  Download,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Crown,
  Zap,
  Building,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  Scissors,
  DollarSign,
  Eye,
  Edit,
  UserCheck,
  ArrowUpDown,
} from "lucide-react";
import Button from "../../components/ui/Button";
import AppointmentList from "../../components/appointment/AppointmentList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppointmentDetails from "../../components/appointment/AppointmentDetails";
import { Modal } from "antd"; // Ant Design Modal import karo

const AdminAppointmentManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [showAssignEmployee, setShowAssignEmployee] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    revenue: 0,
    pending: 0,
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        let url = "/appointments/admin/appointments";
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (selectedStatus && selectedStatus !== "All")
          params.append("status", selectedStatus);

        if (startDate instanceof Date && !isNaN(startDate)) {
          params.append("startDate", startDate.toISOString());
        }
        if (endDate instanceof Date && !isNaN(endDate)) {
          params.append("endDate", endDate.toISOString());
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await api.get(url);
        const appointmentsData = res.data;

        // Sort appointments
        const sortedAppointments = sortAppointments(
          appointmentsData,
          sortBy,
          sortOrder
        );
        setAppointments(sortedAppointments);

        // Calculate stats
        calculateStats(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [
    searchTerm,
    selectedStatus,
    startDate,
    endDate,
    refetch,
    sortBy,
    sortOrder,
  ]);

  const sortAppointments = (appointments, sortBy, order) => {
    return [...appointments].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.appointmentDateTime);
          bValue = new Date(b.appointmentDateTime);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "customer":
          aValue = a.userId?.name || "";
          bValue = b.userId?.name || "";
          break;
        case "price":
          aValue = a.totalPrice || 0;
          bValue = b.totalPrice || 0;
          break;
        default:
          aValue = new Date(a.appointmentDateTime);
          bValue = new Date(b.appointmentDateTime);
      }

      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const calculateStats = (appointmentsData) => {
    const total = appointmentsData.length;
    const completed = appointmentsData.filter(
      (a) => a.status === "Completed"
    ).length;
    const upcoming = appointmentsData.filter(
      (a) => a.status === "Confirmed" || a.status === "In Progress"
    ).length;
    const pending = appointmentsData.filter(
      (a) => a.status === "Pending"
    ).length;
    const revenue = appointmentsData
      .filter((a) => a.status === "Completed")
      .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

    setStats({
      total,
      completed,
      upcoming,
      pending,
      revenue,
    });
  };

  const fetchAvailableEmployees = async (appointmentId) => {
    try {
      const res = await api.get(
        `/appointments/${appointmentId}/available-employees`
      );
      setAvailableEmployees(res.data.availableEmployees);
      console.log(res.data.availableEmployees);
    } catch (error) {
      console.error("Error fetching available employees:", error);
    }
  };

  const handleAssignEmployee = async (appointmentId, employeeId) => {
    try {
      setAssignLoading(true);
      await api.post(`/appointments/${appointmentId}/assign-employee`, {
        employeeId,
      });
      setRefetch((prev) => !prev);
      setShowAssignEmployee(false);
      setSelectedAppointment(null);
      setModalVisible(false); // Modal close karo
    } catch (error) {
      console.error("Error assigning employee:", error);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAppointmentClick = async (appointment) => {
    // ✅ Ensure we're using the appointment data correctly
    console.log("Clicked appointment:", appointment);

    // If appointment is from API response, extract the appointment object
    let appointmentData = appointment;

    // Check if it's the full API response structure
    if (appointment && appointment.appointment) {
      appointmentData = appointment.appointment;
    }

    setSelectedAppointment(appointmentData);
    setModalVisible(true);

    if (!appointmentData.employeeId || appointmentData.status === "Pending") {
      await fetchAvailableEmployees(appointmentData._id);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
    setShowAssignEmployee(false);
  };

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const paymentStatusOptions = ["Pending", "Paid", "Refunded", "Cash"];

  const sortOptions = [
    { value: "date", label: "Appointment Date" },
    { value: "status", label: "Status" },
    { value: "customer", label: "Customer Name" },
    { value: "price", label: "Total Price" },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });
      setRefetch((prev) => !prev);
      setSelectedAppointment(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePaymentStatusUpdate = async (appointmentId, newPaymentStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/payment-status`, {
        paymentStatus: newPaymentStatus,
      });
      setRefetch((prev) => !prev);
      setSelectedAppointment(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/complete`);
      setRefetch((prev) => !prev);
      setSelectedAppointment(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const statCards = [
    {
      name: "Total Appointments",
      value: stats.total,
      icon: CalendarDays,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "All appointments",
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
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      description: "Scheduled appointments",
    },
    {
      name: "Total Revenue",
      value: `₹${stats.revenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "From completed appointments",
    },
  ];

  const hasActiveFilters = searchTerm || selectedStatus || startDate || endDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-blue-100">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[philosopher]">
                  Appointment Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and monitor all spa appointments in one place
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat) => (
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
                {stat.name === "Total Appointments" && stats.total > 0 && (
                  <div className="flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Filters Card */}
        <Card className="border-0 text-black shadow-lg">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-rose-600" />
                Filter & Search Appointments
              </h2>

              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border-0 bg-transparent font-medium text-gray-700 focus:ring-0 focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-all duration-200"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  className="block w-full px-3 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-xl transition-all duration-200"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value === "All" ? "" : e.target.value
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-all duration-200"
                />
              </div>

              <div className="flex items-center space-x-2">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Showing filtered results •
                  {searchTerm && ` Search: "${searchTerm}"`}
                  {selectedStatus && ` Status: ${selectedStatus}`}
                  {startDate && ` From: ${startDate.toLocaleDateString()}`}
                  {endDate && ` To: ${endDate.toLocaleDateString()}`}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Appointments List */}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-rose-600" />
                  All Appointments
                  <span className="bg-rose-100 text-rose-800 text-sm font-medium px-2 py-1 rounded-full">
                    {appointments.length}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {hasActiveFilters
                    ? `Showing ${appointments.length} filtered appointments`
                    : "All appointments in the system"}
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
                <p className="text-gray-600">Loading appointments...</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please wait a moment
                </p>
              </div>
            ) : appointments.length > 0 ? (
              <AppointmentList
                appointments={appointments}
                showUser={true}
                showEmployee={true}
                showRoom={true}
                showPrice={true}
                variant="card"
                onAppointmentClick={handleAppointmentClick}
              />
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200">
                  <CalendarIcon className="h-10 w-10 text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[philosopher]">
                  No Appointments Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No appointments match your current filters. Try adjusting your search criteria."
                    : "There are no appointments in the system yet."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Ant Design Modal for Appointment Details */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 font-[philosopher]">
                {showAssignEmployee ? "Assign Employee" : "Appointment Details"}
              </span>
            </div>
          }
          open={modalVisible}
          onCancel={handleModalClose}
          footer={null}
          width="90%"
          style={{ maxWidth: "1200px" }}
          className="appointment-details-modal"
        >
          {selectedAppointment && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {showAssignEmployee ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      Assign Employee
                    </h4>
                    <p className="text-gray-600">
                      Select an available employee for this appointment.
                      Employees are automatically filtered by:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc pl-5 mt-3 space-y-1">
                      <li>Matching working location with room location</li>
                      <li>
                        Having the required role for this service category
                      </li>
                      <li>Being available at the appointment time</li>
                    </ul>
                  </div>

                  {availableEmployees.length > 0 ? (
                    <div className="grid gap-4">
                      {availableEmployees.map((employee) => (
                        <div
                          key={employee._id}
                          className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                {employee.name}
                                <span className="text-sm font-mono text-gray-500 ml-2">
                                  ({employee.employeeId})
                                </span>
                              </p>
                              <p className="text-gray-600">
                                {employee.employeeRole} •{" "}
                                {employee.workingLocation}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              handleAssignEmployee(
                                selectedAppointment._id,
                                employee._id
                              )
                            }
                            disabled={assignLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 border-0 hover:from-blue-600 hover:to-indigo-600"
                          >
                            <UserPlus className="h-4 w-4" />
                            {assignLoading ? "Assigning..." : "Assign"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No Available Employees
                      </h4>
                      <p className="text-gray-600">
                        No employees match the criteria for this appointment at
                        the moment.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setShowAssignEmployee(false)}
                    className="w-full mt-6"
                  >
                    Back to Appointment Details
                  </Button>
                </div>
              ) : (
                <AppointmentDetails
                  appointment={selectedAppointment}
                  adminView={true}
                  onClose={handleModalClose}
                  onStatusUpdate={handleStatusUpdate}
                  onPaymentStatusUpdate={handlePaymentStatusUpdate}
                  onCompleteAppointment={handleCompleteAppointment}
                  statusOptions={statusOptions.filter((opt) => opt !== "All")}
                  paymentStatusOptions={paymentStatusOptions}
                  showAssignButton={
                    !selectedAppointment.employeeId ||
                    selectedAppointment.status === "Pending"
                  }
                  onAssignEmployee={() => setShowAssignEmployee(true)}
                />
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminAppointmentManagement;
