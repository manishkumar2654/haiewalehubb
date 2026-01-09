import React from "react";
import { format } from "date-fns";
import {
  Check,
  Calendar,
  Clock,
  User,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Plus,
  Building,
  Home,
} from "lucide-react";

const Confirmation = ({
  appointment,
  selectedDuration,
  navigate,
  setActiveTab,
  setSelectedService,
  setSelectedDuration,
  setAppointment,
  createdBy,
  customerDetails,
  isMassageService,
}) => {
  // Get room price properly
  const roomPrice = appointment?.roomPrice || appointment?.roomId?.price || 0;

  // Calculate total price
  const servicePrice =
    appointment?.servicePrice || selectedDuration?.price || 0;
  const totalPrice = servicePrice + roomPrice;

  // ✅ FIX: Get customer details from sessionStorage if state is null
  const tempDetails = sessionStorage.getItem("tempCustomerDetails");
  const displayCustomerDetails = tempDetails
    ? JSON.parse(tempDetails)
    : customerDetails;

  const handleBookAnother = () => {
    setActiveTab("services");
    setSelectedService(null);
    setSelectedDuration(null);
    setAppointment(null);
    sessionStorage.removeItem("tempCustomerDetails");
  };

  const InfoCard = ({ icon: Icon, title, children, className = "", badge }) => (
    <div
      className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Icon className="h-5 w-5 text-rose-600" />
          </div>
          <h3 className="text-lg font-semibold font-[philosopher] text-gray-800">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const DetailItem = ({ label, value, icon: Icon, subText }) => (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {Icon && (
            <div className="mt-0.5">
              <Icon className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-600 font-[poppins]">
              {label}
            </span>
            {subText && <p className="text-xs text-gray-500 mt-1">{subText}</p>}
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-[poppins] text-gray-800 font-semibold">
            {value}
          </span>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = "rose" }) => (
    <div className={`bg-${color}-50 p-4 rounded-xl border border-${color}-200`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 text-${color}-600`} />
        <span
          className={`text-sm font-medium text-${color}-700 font-[poppins]`}
        >
          {label}
        </span>
      </div>
      <p className={`text-xl font-bold text-${color}-800 font-[philosopher]`}>
        {value}
      </p>
    </div>
  );

  const NextStep = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
        <Icon className="h-5 w-5 text-rose-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 font-[poppins] mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-600 font-[poppins]">{description}</p>
      </div>
    </div>
  );

  // ✅ Check if appointment has room details (for massage services)
  const hasRoomDetails =
    appointment?.roomId || appointment?.type !== "Standard";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-[philosopher] text-gray-900 mb-4">
          Booking Scheduled
        </h1>
        <p className="text-lg text-gray-600 font-[poppins] max-w-2xl mx-auto mb-6">
          Your appointment has been successfully scheduled. We will send you a
          confiramtion mail shortly.
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-rose-500 to-amber-500 mx-auto rounded-full"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Calendar}
          label="Date"
          value={
            appointment?.appointmentDateTime
              ? format(
                  new Date(appointment.appointmentDateTime),
                  "MMM dd, yyyy"
                )
              : "N/A"
          }
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Time"
          value={
            appointment?.appointmentDateTime
              ? format(new Date(appointment.appointmentDateTime), "h:mm a")
              : "N/A"
          }
          color="amber"
        />
        <StatCard
          icon={CreditCard}
          label="Total"
          value={`₹${totalPrice}`}
          color="emerald"
        />
        <StatCard
          icon={User}
          label="Duration"
          value={`${
            selectedDuration?.duration ||
            appointment?.serviceId?.pricing?.[0]?.durationMinutes ||
            60
          } min`}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <InfoCard
              icon={User}
              title={
                displayCustomerDetails?.name
                  ? "Customer Details"
                  : "Your Details"
              }
              badge="Personal"
            >
              {displayCustomerDetails && displayCustomerDetails.name ? (
                <>
                  <DetailItem
                    label="Full Name"
                    value={displayCustomerDetails.name}
                    icon={User}
                  />
                  <DetailItem
                    label="Phone Number"
                    value={displayCustomerDetails.phone}
                    icon={Phone}
                  />
                  {displayCustomerDetails.email && (
                    <DetailItem
                      label="Email Address"
                      value={displayCustomerDetails.email}
                      icon={Mail}
                    />
                  )}
                </>
              ) : (
                <>
                  <DetailItem
                    label="Full Name"
                    value={appointment?.userId?.name}
                    icon={User}
                  />
                  <DetailItem
                    label="Phone Number"
                    value={appointment?.userId?.phone}
                    icon={Phone}
                  />
                  {appointment?.userId?.email && (
                    <DetailItem
                      label="Email Address"
                      value={appointment?.userId?.email}
                      icon={Mail}
                    />
                  )}
                </>
              )}
            </InfoCard>

            {/* Booking Information */}
            <InfoCard
              icon={CreditCard}
              title="Booking Information"
              badge="Details"
            >
              <DetailItem
                label="Appointment ID"
                value={appointment?.appointmentId}
                subText="Use this for reference"
              />
              <DetailItem
                label="Booked By"
                value={createdBy}
                subText="Who made the booking"
              />
              <DetailItem
                label="Status"
                value={
                  <span
                    className={`capitalize px-3 py-1 rounded-full text-xs font-medium ${
                      appointment?.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment?.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment?.status}
                  </span>
                }
              />
              <DetailItem
                label="Payment Method"
                value={
                  appointment?.paymentMethod === "online"
                    ? "Online Payment"
                    : "Cash at Counter"
                }
              />
            </InfoCard>
          </div>

          {/* Service & Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Details */}
            <InfoCard icon={Check} title="Service Details" badge="Selected">
              <DetailItem
                label="Service Name"
                value={appointment?.serviceId?.name}
              />
              <DetailItem
                label="Description"
                value={
                  <span className="text-gray-700">
                    {appointment?.serviceId?.description ||
                      "Premium spa service"}
                  </span>
                }
              />
              <DetailItem
                label="Duration"
                value={`${
                  selectedDuration?.duration ||
                  appointment?.serviceId?.pricing?.[0]?.durationMinutes ||
                  60
                } minutes`}
                icon={Clock}
              />
              <div className="pt-3 border-t border-gray-200">
                <DetailItem
                  label="Service Price"
                  value={`₹${servicePrice}`}
                  icon={CreditCard}
                />
              </div>
            </InfoCard>

            {/* Room Details */}
            {hasRoomDetails ? (
              <InfoCard
                icon={Building}
                title="Room & Branch Details"
                badge="Location"
              >
                <DetailItem
                  label="Room Type"
                  value={appointment?.roomId?.type || appointment?.type}
                  icon={Home}
                />
                <DetailItem
                  label="Room Number"
                  value={appointment?.roomId?.roomNumber || "Will be assigned"}
                  subText="Check at reception"
                />
                <DetailItem
                  label="Branch"
                  value={`${
                    appointment?.roomId?.branch?.name || "Main"
                  } Branch`}
                  icon={Building}
                />
                <DetailItem
                  label="Address"
                  value={
                    appointment?.roomId?.branch?.address || "Main Spa Location"
                  }
                  icon={MapPin}
                />
                <DetailItem
                  label="Contact"
                  value={appointment?.roomId?.branch?.phone || "+91-XXXXXXXXXX"}
                  icon={Phone}
                />
                <div className="pt-3 border-t border-gray-200">
                  <DetailItem
                    label="Room Price"
                    value={`₹${roomPrice}`}
                    icon={CreditCard}
                  />
                </div>
              </InfoCard>
            ) : (
              <InfoCard icon={Home} title="Treatment Area" badge="Standard">
                <DetailItem
                  label="Area Type"
                  value="Standard Treatment Area"
                  icon={Home}
                />
                <DetailItem
                  label="Location"
                  value="Main Spa Floor"
                  icon={MapPin}
                />
                <DetailItem
                  label="Facilities"
                  value="All basic amenities"
                  subText="Towels, robes, lockers"
                />
                <div className="pt-3 border-t border-gray-200">
                  <DetailItem
                    label="Additional Charge"
                    value="₹0 (Included)"
                    icon={CreditCard}
                  />
                </div>
              </InfoCard>
            )}
          </div>

          {/* What's Next Section */}
          <InfoCard icon={Clock} title="What's Next?" badge="Guide">
            <div className="space-y-3">
              <NextStep
                icon={Mail}
                title="Confirmation Email"
                description="Check your inbox for a detailed confirmation email with all appointment details."
              />
              {appointment?.paymentMethod === "cash" && (
                <NextStep
                  icon={CreditCard}
                  title="Payment at Counter"
                  description="Please bring exact cash amount. Payment to be made at reception upon arrival."
                />
              )}
              <NextStep
                icon={Clock}
                title="Arrival Instructions"
                description="Arrive 10-15 minutes before your scheduled time to complete any necessary formalities."
              />
              <NextStep
                icon={User}
                title="What to Bring"
                description="Carry your appointment confirmation and any required identification."
              />
            </div>
          </InfoCard>
        </div>

        {/* Right Column - Payment Summary & Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-300 shadow-sm">
            <h3 className="text-xl font-bold font-[philosopher] text-gray-900 mb-8 text-center">
              Payment Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700 font-[poppins]">
                  Service Price:
                </span>
                <span className="font-semibold text-gray-900 font-[poppins]">
                  ₹{servicePrice}
                </span>
              </div>

              {hasRoomDetails && roomPrice > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-[poppins]">
                    Room Price:
                  </span>
                  <span className="font-semibold text-gray-900 font-[poppins]">
                    ₹{roomPrice}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-4 mt-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold text-gray-900 font-[poppins]">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-gray-900 font-[philosopher]">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-800 font-[poppins]">
                  Payment Status
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-[poppins] font-medium capitalize">
                  {appointment?.paymentMethod === "online"
                    ? "Online Payment"
                    : "Pay at Counter"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment?.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-800"
                      : appointment?.paymentStatus === "Cash"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {appointment?.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold font-[philosopher] text-gray-900 mb-6 text-center">
              Quick Actions
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-[poppins] font-semibold group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                View All Appointments
              </button>

              <button
                onClick={handleBookAnother}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl hover:shadow-lg hover:from-rose-700 hover:to-rose-600 transition-all duration-300 font-[poppins] font-semibold group"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                Book Another Service
              </button>

              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-[poppins] font-medium"
              >
                📄 Print Receipt
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-[poppins] text-center">
                <span className="font-semibold">Need help?</span> Call us at{" "}
                <span className="font-bold">+91-9876543210</span> or email{" "}
                <span className="font-bold">support@spa.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-600 font-[poppins] mb-2">
          Thank you for choosing our spa services!
        </p>
        <p className="text-sm text-gray-500">
          Your wellness journey begins here. We can't wait to see you!
        </p>
      </div>
    </div>
  );
};

export default Confirmation;
