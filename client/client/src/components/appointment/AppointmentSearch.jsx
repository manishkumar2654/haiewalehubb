import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom"; // Add this
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Info,
  UserPlus,
  Crown,
  Sparkles,
  Edit,
  Save,
  X,
  Search,
  Users,
  ArrowRight,
  Sparkles as SparklesIcon,
} from "lucide-react";

const AppointmentSearch = () => {
  const [showOverlay, setShowOverlay] = useState(true); // Start with overlay visible
  const [selectedOption, setSelectedOption] = useState(null);
  const [appointmentId, setAppointmentId] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updatedAppointment, setUpdatedAppointment] = useState(null);

  const navigate = useNavigate(); // Initialize navigate

  // Available options for dropdowns
  const roomTypes = ["Silver", "Gold", "Diamond"];
  const statusOptions = ["Pending", "Confirmed", "Cancelled", "Completed"];
  const paymentStatusOptions = ["Pending", "Paid", "Refunded", "Cash"];
  const paymentMethods = ["online", "cash"];

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    if (option === "walkin") {
      navigate("/walkin-booking"); // Navigate to walkin booking page
    } else {
      setShowOverlay(false); // Hide overlay and show search page
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!appointmentId.trim()) {
      toast.error("Please enter an appointment ID");
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const response = await api.get(
        `/appointments/details/${appointmentId.trim()}`
      );

      if (response.data.success) {
        setAppointment(response.data.appointment);
        setUpdatedAppointment(response.data.appointment);
        toast.success("Appointment found!");
      } else {
        setAppointment(null);
        setUpdatedAppointment(null);
        toast.error("Appointment not found");
      }
    } catch (error) {
      console.error("Error:", error);
      setAppointment(null);
      setUpdatedAppointment(null);
      toast.error("Appointment not found or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setUpdatedAppointment({ ...appointment });
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setUpdatedAppointment(appointment);
  };

  const handleUpdate = async () => {
    if (!updatedAppointment) return;

    try {
      setUpdating(true);

      // Prepare update data
      const updateData = {
        type: updatedAppointment.type,
        status: updatedAppointment.status,
        paymentStatus: updatedAppointment.paymentStatus,
        paymentMethod: updatedAppointment.paymentMethod,
        servicePrice: updatedAppointment.servicePrice,
        roomPrice: updatedAppointment.roomPrice,
        totalPrice: updatedAppointment.totalPrice,
        appointmentDateTime: updatedAppointment.appointmentDateTime,
        endDateTime: updatedAppointment.endDateTime,
        roomId: updatedAppointment.roomId?._id || updatedAppointment.roomId,
        employeeId:
          updatedAppointment.employeeId?._id || updatedAppointment.employeeId,
      };

      // Update appointment
      const response = await api.put(
        `/appointments/${appointment._id}`,
        updateData
      );

      if (response.data.success) {
        setAppointment(response.data.appointment);
        setUpdatedAppointment(response.data.appointment);
        setEditing(false);
        toast.success("Appointment updated successfully!");
      } else {
        toast.error("Failed to update appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment");
    } finally {
      setUpdating(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setUpdatedAppointment((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate total price when service or room price changes
    if (field === "servicePrice" || field === "roomPrice") {
      const servicePrice =
        field === "servicePrice"
          ? parseFloat(value) || 0
          : prev.servicePrice || 0;
      const roomPrice =
        field === "roomPrice" ? parseFloat(value) || 0 : prev.roomPrice || 0;
      setUpdatedAppointment((prev) => ({
        ...prev,
        totalPrice: servicePrice + roomPrice,
      }));
    }
  };

  // ✅ PDF download function update karein
  const downloadPDF = async () => {
    if (!appointment) return;

    try {
      // Use the new endpoint
      const response = await api.get(
        `/appointments/download-receipt/${appointment.appointmentId}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `appointment-${appointment.appointmentId}-bill.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Bill PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download bill PDF");
      console.error("Error:", error);
    }
  };

  // ✅ QR Code URL update karein
  const getReceiptDownloadUrl = () => {
    if (!appointment) return "";
    return `${window.location.origin}/api/v1/appointments/download-receipt/${appointment.appointmentId}`;
  };

  const resetSearch = () => {
    setAppointmentId("");
    setAppointment(null);
    setUpdatedAppointment(null);
    setSearched(false);
    setEditing(false);
  };

  // Helper functions
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

  const getDuration = () => {
    if (appointment?.serviceId?.pricing?.[0]?.durationMinutes) {
      return `${appointment.serviceId.pricing[0].durationMinutes} minutes`;
    }

    if (appointment?.appointmentDateTime && appointment?.endDateTime) {
      const start = new Date(appointment.appointmentDateTime);
      const end = new Date(appointment.endDateTime);
      const durationMs = end - start;
      const durationMinutes = Math.floor(durationMs / 60000);
      return `${durationMinutes} minutes`;
    }

    return "N/A";
  };

  // Editable field component
  const EditableField = ({
    label,
    value,
    field,
    type = "text",
    options,
    isCurrency = false,
  }) => {
    if (!editing) {
      return (
        <div className="space-y-2 text-black">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p
            className={`font-semibold ${isCurrency ? "text-rose-600 text-lg" : "text-gray-900"
              }`}
          >
            {isCurrency ? formatCurrency(value || 0) : value || "N/A"}
          </p>
        </div>
      );
    }

    if (options) {
      return (
        <div className="space-y-2 text-black">
          <label className="text-sm font-medium text-gray-500">{label}</label>
          <select
            value={value || ""}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <input
          type={type}
          value={value || ""}
          onChange={(e) =>
            handleFieldChange(
              field,
              type === "number"
                ? parseFloat(e.target.value) || 0
                : e.target.value
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
        />
      </div>
    );
  };

  // Glassmorphism Overlay
  // const GlassmorphismOverlay = () => (
  //   <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
  //     <div className="relative  w-full max-w-4xl">
  //       {/* Decorative background elements */}
  //       <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-rose-600/20 to-amber-600/20 rounded-full blur-3xl"></div>
  //       <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-amber-600/20 to-rose-600/20 rounded-full blur-3xl"></div>

  //       <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
  //         {/* Header */}
  //         <div className="p-8 text-center bg-gradient-to-r from-rose-900/20 to-amber-900/20 border-b border-white/10">
  //           <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-600 to-amber-500 rounded-full mb-4">
  //             <SparklesIcon className="w-8 h-8 text-white" />
  //           </div>
  //           <h1 className="text-4xl md:text-5xl font-bold font-[philosopher] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">
  //             Welcome to Booking System
  //           </h1>
  //           <p className="text-lg text-white/80 font-[poppins] max-w-2xl mx-auto">
  //             Choose how you'd like to proceed with booking management
  //           </p>
  //         </div>

  //         {/* Options Grid */}
  //         <div className="p-8 md:p-12">
  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  //             {/* Walk-in Booking Option */}
  //             <div
  //               className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${selectedOption === "walkin"
  //                 ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/50 shadow-2xl shadow-amber-500/20"
  //                 : "bg-white/5 border-white/10 hover:border-amber-400/30 hover:shadow-xl hover:shadow-amber-500/10"
  //                 }`}
  //               onClick={() => handleOptionSelect("walkin")}
  //             >
  //               <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
  //                 <Users className="w-6 h-6 text-white" />
  //               </div>

  //               <div className="mb-6">
  //                 <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
  //                   <UserPlus className="w-8 h-8 text-white" />
  //                 </div>
  //                 <h3 className="text-2xl font-bold font-[philosopher] text-white mb-2">
  //                   Create Walk-in
  //                 </h3>
  //                 <p className="text-white/70 font-[poppins]">
  //                   Book new walk-in customers directly. Add services, products,
  //                   and generate instant bills.
  //                 </p>
  //               </div>

  //               <div className="space-y-3">
  //                 <div className="flex items-center text-white/80">
  //                   <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
  //                   <span className="font-[poppins] text-sm">
  //                     Create new customer booking
  //                   </span>
  //                 </div>
  //                 <div className="flex items-center text-white/80">
  //                   <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
  //                   <span className="font-[poppins] text-sm">
  //                     Add multiple services & products
  //                   </span>
  //                 </div>
  //                 <div className="flex items-center text-white/80">
  //                   <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
  //                   <span className="font-[poppins] text-sm">
  //                     Generate instant bills & QR codes
  //                   </span>
  //                 </div>
  //               </div>

  //               <div
  //                 className={`mt-8 pt-6 border-t ${selectedOption === "walkin"
  //                   ? "border-amber-400/50"
  //                   : "border-white/10"
  //                   }`}
  //               >
  //                 <div className="flex items-center justify-between">
  //                   <span className="text-white font-[poppins] font-medium">
  //                     Go to Walk-in Booking
  //                   </span>
  //                   <ArrowRight
  //                     className={`w-6 h-6 transition-transform group-hover:translate-x-2 ${selectedOption === "walkin"
  //                       ? "text-amber-300"
  //                       : "text-white/50"
  //                       }`}
  //                   />
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Bottom decorative section */}
  //           <div className="mt-12 pt-8 border-t border-white/10">
  //             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
  //               <div className="text-center md:text-left">
  //                 <p className="text-white/60 font-[poppins] text-sm">
  //                   Need help choosing? Contact support
  //                 </p>
  //               </div>
  //               <div className="flex items-center gap-4">

  //                 <div className="flex items-center">
  //                   <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-2"></div>
  //                   <span className="text-white/70 text-sm font-[poppins]">
  //                     Walk-in
  //                   </span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const GlassmorphismOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl">

        {/* Decorative background elements (responsive size) */}
        <div className="absolute -top-24 -right-24 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-r from-rose-600/20 to-amber-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-r from-amber-600/20 to-rose-600/20 rounded-full blur-3xl"></div>

        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="p-6 sm:p-8 text-center bg-gradient-to-r from-rose-900/20 to-amber-900/20 border-b border-white/10">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-600 to-amber-500 rounded-full mb-4">
              <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-[philosopher] mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">
              Welcome to Booking System
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-[poppins] max-w-2xl mx-auto">
              Choose how you'd like to proceed with booking management
            </p>
          </div>

          {/* Options Grid */}
          <div className="p-6 sm:p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Walk-in Booking Option */}
              <div
                onClick={() => handleOptionSelect("walkin")}
                className={`group relative p-6 sm:p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 md:hover:scale-105 
                ${selectedOption === "walkin"
                    ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/50 shadow-2xl shadow-amber-500/20"
                    : "bg-white/5 border-white/10 hover:border-amber-400/30 hover:shadow-xl hover:shadow-amber-500/10"
                  }`}
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>

                <div className="mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-[philosopher] text-white mb-2">
                    Create Walk-in
                  </h3>

                  <p className="text-white/70 font-[poppins] text-sm sm:text-base">
                    Book new walk-in customers directly. Add services, products,
                    and generate instant bills.
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {[
                    "Create new customer booking",
                    "Add multiple services & products",
                    "Generate instant bills & QR codes",
                  ].map((text) => (
                    <div key={text} className="flex items-center text-white/80">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mr-3"></div>
                      <span className="font-[poppins] text-sm">{text}</span>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${selectedOption === "walkin"
                    ? "border-amber-400/50"
                    : "border-white/10"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-[poppins] font-medium text-sm sm:text-base">
                      Go to Walk-in Booking
                    </span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-white/60 font-[poppins] text-sm text-center sm:text-left">
                Need help choosing? Contact support
              </p>

              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-2"></div>
                <span className="text-white/70 text-sm font-[poppins]">
                  Walk-in
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // If overlay should be shown, render it
  if (showOverlay && !selectedOption) {
    return (
      <>
        <ToastContainer position="top-right" />
        <GlassmorphismOverlay />
      </>
    );
  }

  // If selected option is prebooked, show the main search page
  return (
    <div className="min-h-screen pt-30 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-[philosopher] mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-900 to-amber-700">
              Search & Update Appointment
            </span>
          </h1>
          <p className="text-lg text-gray-600 font-[poppins]">
            Enter appointment ID to view complete details, update information,
            and generate QR code
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label
                htmlFor="appointmentId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Appointment ID
              </label>
              <input
                type="text"
                id="appointmentId"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value.toUpperCase())}
                placeholder="Enter appointment ID (e.g., APP000001)"
                className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-lg font-medium uppercase"
                disabled={loading}
              />
            </div>
            <div className="flex items-end space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </button>
              {searched && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        {searched && appointment && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Details - 3/4 width */}
            <div className="lg:col-span-3 space-y-6">
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
                          Created on{" "}
                          {format(new Date(appointment.createdAt), "PPpp")}
                        </p>
                      </div>
                    </div>

                    {/* Created By Section */}
                    <div className="flex items-center gap-2 mt-3 p-3 bg-white/80 rounded-lg border border-rose-100">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Booked by:{" "}
                        <span className="text-rose-700">
                          {appointment.createdBy?.name ||
                            appointment.userId?.name ||
                            "System"}
                          {appointment.createdBy?.employeeRole && (
                            <span className="text-amber-600 ml-1">
                              ({appointment.createdBy.employeeRole})
                            </span>
                          )}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          updatedAppointment?.status || appointment.status
                        )}`}
                      >
                        {updatedAppointment?.status || appointment.status}
                      </span>
                      {!editing && (
                        <button
                          onClick={handleEdit}
                          className="p-2 text-gray-600 hover:text-rose-600 transition-colors"
                          title="Edit Appointment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <span
                      className={`px-3 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                        updatedAppointment?.paymentStatus ||
                        appointment.paymentStatus
                      )}`}
                    >
                      {updatedAppointment?.paymentStatus ||
                        appointment.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Edit Mode Actions */}
                {editing && (
                  <div className="flex gap-3 mt-4 p-4 bg-white rounded-lg border border-amber-200">
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
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
                    <p className="text-sm font-medium text-gray-500">
                      Category
                    </p>
                    <p className="font-semibold text-gray-900">
                      {appointment.serviceId?.category?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900">
                      {getDuration()}
                    </p>
                  </div>
                  <EditableField
                    label="Service Price"
                    value={updatedAppointment?.servicePrice}
                    field="servicePrice"
                    type="number"
                    isCurrency={true}
                  />
                </div>
                {appointment.serviceId?.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Description
                    </p>
                    <p className="text-gray-700 text-sm">
                      {appointment.serviceId.description}
                    </p>
                  </div>
                )}
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
                      {new Date(
                        appointment.appointmentDateTime
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Time Slot
                    </p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {format(
                        new Date(appointment.appointmentDateTime),
                        "h:mm a"
                      )}{" "}
                      - {format(new Date(appointment.endDateTime), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Details - Improved Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  Room & Branch Details
                </h3>

                {/* Basic Room Information - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Room Number
                    </p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {appointment.roomId?.roomNumber || "N/A"}
                    </p>
                  </div>

                  <EditableField
                    label="Room Type"
                    value={updatedAppointment?.type}
                    field="type"
                    options={roomTypes}
                  />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Room Status
                    </p>
                    <p className="font-semibold text-gray-900">
                      {appointment.roomId?.status || "N/A"}
                    </p>
                  </div>

                  <EditableField
                    label="Room Price"
                    value={updatedAppointment?.roomPrice}
                    field="roomPrice"
                    type="number"
                    isCurrency={true}
                  />
                </div>

                {/* Branch Details Section */}
                {appointment.roomId?.branch ? (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-800 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Branch Information
                      </h4>

                      {/* Premium Badge if applicable */}
                      {appointment.roomId.branch.premium && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Premium Branch
                        </span>
                      )}
                    </div>

                    {/* Branch Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Branch Name
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {appointment.roomId.branch.name}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Address
                        </p>
                        <p className="font-semibold text-gray-900">
                          {appointment.roomId.branch.address || "Not specified"}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Contact
                        </p>
                        <div className="space-y-1">
                          {appointment.roomId.branch.phone && (
                            <p className="font-semibold text-gray-900 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              Mobile: {appointment.roomId.branch.phone}
                            </p>
                          )}
                          {appointment.roomId.branch.landline && (
                            <p className="font-semibold text-gray-900 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Landline: {appointment.roomId.branch.landline}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    {appointment.roomId.branch.workingHours && (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Working Hours
                        </p>
                        <p className="font-semibold text-gray-900 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {appointment.roomId.branch.workingHours}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* If no branch information */
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-600 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No branch information available for this room
                    </p>
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
                      <p className="text-sm font-medium text-gray-500">
                        Employee ID
                      </p>
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
                        Working Location
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
                  <EditableField
                    label="Payment Method"
                    value={updatedAppointment?.paymentMethod}
                    field="paymentMethod"
                    options={paymentMethods}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Service Price
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(updatedAppointment?.servicePrice || 0)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Room Price
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(updatedAppointment?.roomPrice || 0)}
                    </p>
                  </div>
                  <div className="space-y-2 bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-gray-700">
                      Total Amount
                    </p>
                    <p className="font-bold text-2xl text-rose-700">
                      {formatCurrency(updatedAppointment?.totalPrice || 0)}
                    </p>
                  </div>
                </div>

                {/* Status Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <EditableField
                    label="Appointment Status"
                    value={updatedAppointment?.status}
                    field="status"
                    options={statusOptions}
                  />
                  <EditableField
                    label="Payment Status"
                    value={updatedAppointment?.paymentStatus}
                    field="paymentStatus"
                    options={paymentStatusOptions}
                  />
                </div>
              </div>
            </div>

            {/* QR Code Section - 1/4 width */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/30 sticky top-6">
                <h3 className="text-xl font-bold font-[philosopher] text-rose-900 mb-4 text-center">
                  📄 Generate QR Code
                </h3>

                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code for PDF Download */}
                  <div className="bg-white p-4 rounded-lg border-2 border-rose-200">
                    <QRCodeCanvas
                      id="qrcode-pdf"
                      value={getReceiptDownloadUrl()}
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code to{" "}
                    <span className="font-semibold text-rose-700">
                      automatically download PDF receipt
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      onClick={downloadPDF}
                      className="w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download PDF Directly
                    </button>

                    <button
                      onClick={() => {
                        const canvas = document.getElementById("qrcode-pdf");
                        if (canvas) {
                          const pngUrl = canvas.toDataURL("image/png");
                          const downloadLink = document.createElement("a");
                          downloadLink.href = pngUrl;
                          downloadLink.download = `appointment-${appointment.appointmentId}-qrcode.png`;
                          document.body.appendChild(downloadLink);
                          downloadLink.click();
                          document.body.removeChild(downloadLink);
                        }
                      }}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Download QR Code Image
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                    <h4 className="font-semibold text-amber-800 text-sm mb-2">
                      📱 How to use:
                    </h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>1. Scan QR with phone camera</li>
                      <li>2. PDF will automatically download</li>
                      <li>3. Open PDF from downloads</li>
                      <li className="font-bold">SAME PDF for both methods!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Found */}
        {searched && !appointment && (
          <div className="col-span-3 text-center py-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/30">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Appointment Not Found
              </h3>
              <p className="text-gray-600 mb-4">
                No appointment found with ID:{" "}
                <span className="font-mono">{appointmentId}</span>
              </p>
              <button
                onClick={resetSearch}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Try Another ID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentSearch;
