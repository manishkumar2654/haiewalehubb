import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import Button from "../../components/ui/Button";
import AppointmentList from "../../components/appointment/AppointmentList";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppointmentDetails from "../../components/appointment/AppointmentDetails";

const EmployeeAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        let url = `/appointments/employees/${user._id}/appointments`;
        const params = new URLSearchParams();

        if (selectedStatus && selectedStatus !== "All") {
          params.append("status", selectedStatus);
        }

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
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching employee appointments:", error);
        alert(
          `Failed to fetch appointments: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchAppointments();
    }
  }, [user, selectedStatus, startDate, endDate]);

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  const clearFilters = () => {
    setSelectedStatus("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
              className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span className="text-gray-500">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!selectedStatus && !startDate && !endDate}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Appointments List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : appointments.length > 0 ? (
          <AppointmentList
            appointments={appointments}
            showUser={true}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filter criteria
            </p>
          </div>
        )}
      </Card>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <AppointmentDetails
                appointment={selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAppointments;
