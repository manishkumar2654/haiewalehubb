import React from "react";
import { format } from "date-fns";
import { Users, Star, Crown } from "lucide-react";

const RoomTypeSelection = ({
  roomTypes,
  selectedRoomType,
  setSelectedRoomType,
  selectedService,
  selectedDuration,
  selectedDateTime,
  handleProceedToSummary,
  setActiveTab,
}) => {
  const getRoomIcon = (roomType) => {
    switch (roomType.toLowerCase()) {
      case "silver":
        return <Star className="h-5 w-5 text-gray-600" />;
      case "gold":
        return <Star className="h-5 w-5 text-amber-500" />;
      case "diamond":
        return <Crown className="h-5 w-5 text-rose-600" />;
      default:
        return <Users className="h-5 w-5 text-rose-600" />;
    }
  };

  const getRoomColorClass = (roomType) => {
    switch (roomType.toLowerCase()) {
      case "silver":
        return "from-gray-50 to-gray-100 border-gray-200";
      case "gold":
        return "from-amber-50 to-amber-100 border-amber-200";
      case "diamond":
        return "from-rose-50 to-pink-100 border-rose-200";
      default:
        return "from-white to-gray-50 border-gray-200";
    }
  };
  const isMassage =
    selectedService?.category?.name?.toLowerCase() === "massage";

  if (!isMassage) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Room Selection Not Required
          </h3>
          <p className="text-gray-600 mb-6">
            Room type selection is only available for massage services. Your
            selected service{" "}
            <span className="font-semibold">{selectedService?.name}</span>
            will be performed in our standard treatment area.
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h4 className="font-bold text-blue-800 mb-3">
            Your Booking Summary:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-black">Service</p>
              <p className="font-semibold text-black">
                {selectedService?.name}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Duration/Type</p>
              <p className="font-semibold text-black">
                {selectedDuration?.duration}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold text-black">
                {selectedDateTime &&
                  format(new Date(selectedDateTime), "h:mm a")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab("datetime-selection")}
            className="py-3 px-6 border border-rose-300 text-rose-700 rounded-xl hover:bg-white transition-all duration-300 font-[poppins] font-medium"
          >
            ← Back
          </button>
          <button
            onClick={handleProceedToSummary}
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-lg font-medium transition-all"
          >
            Continue to Next Step →
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-2">
      {/* Enhanced Booking Summary */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/30">
        <h2 className="text-2xl font-bold font-[philosopher] mb-6 text-rose-900 text-center">
          Booking Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-rose-50 rounded-xl">
            <h3 className="text-sm font-medium mb-2 font-[poppins] text-rose-700">
              Service
            </h3>
            <p className="font-[poppins] text-rose-900 font-semibold">
              {selectedService?.name}
            </p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <h3 className="text-sm font-medium mb-2 font-[poppins] text-amber-700">
              Duration & Price
            </h3>
            <p className="font-[poppins] text-amber-900 font-semibold">
              {selectedDuration?.duration} (₹{selectedDuration?.price})
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <h3 className="text-sm font-medium mb-2 font-[poppins] text-green-700">
              Date & Time
            </h3>
            <p className="font-[poppins] text-green-900 font-semibold">
              {selectedDateTime &&
                format(new Date(selectedDateTime), "EEE, MMM dd, yyyy h:mm a")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/30">
        <div className="p-8 border-b border-rose-100">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold font-[philosopher] text-rose-900 mb-3">
              Choose Your Room Experience
            </h3>
            <p className="text-gray-600 font-[poppins]">
              Select the perfect ambiance for your spa journey. Each room offers
              unique features for your comfort.
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roomTypes.map((roomType) => (
              <div
                key={roomType.type}
                className={`bg-gradient-to-br ${getRoomColorClass(
                  roomType.type
                )} border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedRoomType === roomType.type
                    ? "ring-4 ring-rose-200 shadow-2xl"
                    : "shadow-lg hover:shadow-xl"
                }`}
                onClick={() => setSelectedRoomType(roomType.type)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getRoomIcon(roomType.type)}
                    <h4 className="text-xl font-bold font-[philosopher] text-gray-800">
                      {roomType.type}
                    </h4>
                  </div>
                  <span className="text-2xl font-bold font-[poppins] text-rose-700">
                    ₹{roomType.price}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm font-[poppins] text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-rose-600" />
                    Perfect for {roomType.capacity} person
                    {roomType.capacity > 1 ? "s" : ""}
                  </div>

                  {/* Room Features based on type */}
                  {roomType.type.toLowerCase() === "diamond" && (
                    <div className="text-xs font-[poppins] text-rose-600 bg-rose-50 p-2 rounded-lg">
                      🎯 Premium amenities • Private suite • Luxury products
                    </div>
                  )}
                  {roomType.type.toLowerCase() === "gold" && (
                    <div className="text-xs font-[poppins] text-amber-600 bg-amber-50 p-2 rounded-lg">
                      ⭐ Enhanced comfort • Premium products • Extra amenities
                    </div>
                  )}
                  {roomType.type.toLowerCase() === "silver" && (
                    <div className="text-xs font-[poppins] text-gray-600 bg-gray-50 p-2 rounded-lg">
                      💫 Standard comfort • Quality service • Cozy atmosphere
                    </div>
                  )}
                </div>

                {selectedRoomType === roomType.type && (
                  <div className="mt-4 p-2 bg-rose-600 text-white text-center rounded-lg text-sm font-[poppins] font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-rose-50/30 flex flex-col sm:flex-row justify-between gap-4 border-t border-rose-100">
          <button
            onClick={() => setActiveTab("datetime-selection")}
            className="py-3 px-6 border border-rose-300 text-rose-700 rounded-xl hover:bg-white transition-all duration-300 font-[poppins] font-medium"
          >
            ← Back to Time Selection
          </button>
          <button
            onClick={handleProceedToSummary}
            disabled={!selectedRoomType}
            className={`py-3 px-8 rounded-xl text-white transition-all duration-300 font-[poppins] font-medium ${
              !selectedRoomType
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-700 to-rose-600 hover:shadow-lg shadow-md hover:from-rose-600 hover:to-rose-500"
            }`}
          >
            Continue to Summary →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeSelection;
