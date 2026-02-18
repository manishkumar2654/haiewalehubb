import React from "react";
import { CreditCard, Wallet, Shield } from "lucide-react";

const Summary = ({
  selectedService,
  selectedDuration,
  selectedRoomType,
  roomTypes,
  selectedDateTime,
  totalPrice,
  paymentMethod,
  handlePaymentMethodChange,
  handleConfirmBooking,
  loading,
  setActiveTab,
  createdBy,
  customerDetails,
  currentUser,
  isMassageService,
}) => {
  const roomType = roomTypes.find((room) => room.type === selectedRoomType);
  const tempDetails = sessionStorage.getItem("tempCustomerDetails");
  const displayCustomerDetails = tempDetails
    ? JSON.parse(tempDetails)
    : customerDetails;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-[philosopher] mb-3 text-rose-900">
          Appointment Summary
        </h2>
        <p className="text-gray-600 font-[poppins]">
          Review your booking details before confirmation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Details */}
        <div className="space-y-6">
          {/* Booked By Section */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200">
            <h3 className="text-lg font-semibold mb-3 text-rose-900 font-[philosopher] flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Booked By
            </h3>
            <p className="text-rose-700 font-[poppins] font-medium">
              {createdBy}
            </p>
          </div>

          {/* Customer Details Section */}
          {displayCustomerDetails && displayCustomerDetails.name ? (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-900 font-[philosopher] flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Customer Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="font-medium text-green-800 font-[poppins]">
                    Name:
                  </span>
                  <span className="text-green-700 font-[poppins]">
                    {displayCustomerDetails.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="font-medium text-green-800 font-[poppins]">
                    Phone:
                  </span>
                  <span className="text-green-700 font-[poppins]">
                    {displayCustomerDetails.phone}
                  </span>
                </div>
                {displayCustomerDetails.email && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-green-800 font-[poppins]">
                      Email:
                    </span>
                    <span className="text-green-700 font-[poppins]">
                      {displayCustomerDetails.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 font-[philosopher]">
                Your Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700 font-[poppins]">
                    Name:
                  </span>
                  <span className="text-gray-600 font-[poppins]">
                    {currentUser?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700 font-[poppins]">
                    Phone:
                  </span>
                  <span className="text-gray-600 font-[poppins]">
                    {currentUser?.phone}
                  </span>
                </div>
                {currentUser?.email && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-700 font-[poppins]">
                      Email:
                    </span>
                    <span className="text-gray-600 font-[poppins]">
                      {currentUser?.email}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Details */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-rose-900 font-[philosopher]">
              Service Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-[poppins]">Service:</span>
                <span className="font-semibold text-rose-900 font-[poppins]">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-[poppins]">Duration:</span>
                <span className="font-semibold text-rose-900 font-[poppins]">
                  {selectedDuration?.duration}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-[poppins]">
                  Date & Time:
                </span>
                <span className="font-semibold text-rose-900 font-[poppins]">
                  {new Date(selectedDateTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Summary */}
        <div className="space-y-6">
          {/* Price Summary */}
          {/* Price Summary */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
            <h3 className="text-lg font-semibold mb-4 text-amber-900 font-[philosopher]">
              Price Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-amber-800 font-[poppins]">
                  Service Price:
                </span>
                <span className="font-semibold text-amber-900 font-[poppins]">
                  ₹{selectedDuration?.price}
                </span>
              </div>

              {/* Room price sirf massage services ke liye */}
              {isMassageService && selectedRoomType && roomType && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-amber-800 font-[poppins]">
                    Room Price ({selectedRoomType}):
                  </span>
                  <span className="font-semibold text-amber-900 font-[poppins]">
                    ₹{roomType.price}
                  </span>
                </div>
              )}

              <div className="border-t border-amber-300 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-amber-900 font-[poppins]">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-amber-900 font-[poppins]">
                    ₹{totalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-rose-900 font-[philosopher] flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h3>

            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-rose-200 rounded-xl cursor-pointer hover:border-rose-400 transition-all duration-300 bg-rose-50/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => handlePaymentMethodChange("cash")}
                  className="h-5 w-5 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-4 flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-900 font-[poppins]">
                      Pay at Counter
                    </p>
                    <p className="text-sm text-rose-600 font-[poppins]">
                      Pay with cash when you arrive
                    </p>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-rose-200 rounded-xl cursor-pointer hover:border-rose-400 transition-all duration-300 bg-rose-50/50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => handlePaymentMethodChange("online")}
                  className="h-5 w-5 text-rose-600 focus:ring-rose-500"
                />
                <div className="ml-4 flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-900 font-[poppins]">
                      Pay Online
                    </p>
                    <p className="text-sm text-rose-600 font-[poppins]">
                      Secure payment with Razorpay
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => setActiveTab("room-selection")}
              className="flex-1 py-4 px-6 border-2 border-rose-300 text-rose-700 rounded-xl hover:bg-rose-50 transition-all duration-300 font-[poppins] font-semibold text-center"
            >
              ← Back
            </button>

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-[poppins] font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </span>
              ) : (
                `Confirm ${
                  paymentMethod === "online" ? "& Pay Now" : "Booking"
                }`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
