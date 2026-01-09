import React from "react";
import { format } from "date-fns";
import { Clock, Calendar } from "lucide-react";

const DateTimeSelection = ({
  selectedService,
  selectedDuration,
  selectedDateTime,
  handleSelectDuration,
  handleDateTimeChange,
  handleProceedToRoomSelection,
  setActiveTab,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-2">
      {/* Service Summary Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-white/30">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {selectedService.images?.[0] && (
            <img
              src={selectedService.images[0]}
              alt={selectedService.name}
              className="w-full sm:w-32 h-32 rounded-xl object-cover shadow-md"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-[philosopher] text-rose-900 mb-2">
              {selectedService?.name}
            </h2>
            <p className="text-gray-600 font-[poppins] leading-relaxed">
              {selectedService?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/30">
        {/* Duration Selection */}
        <div className="p-6 border-b border-rose-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Clock className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold font-[philosopher] text-rose-900">
                Select Duration
              </h3>
              <p className="text-sm font-[poppins] text-rose-700">
                Choose your preferred treatment duration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedService.pricing?.map((duration) => (
              <div
                key={duration._id || duration.duration}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedDuration?.duration === duration.duration
                    ? "border-rose-600 bg-rose-50 shadow-md"
                    : "border-rose-200 hover:border-rose-400 hover:bg-rose-50/50"
                }`}
                onClick={() => handleSelectDuration(duration)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold font-[poppins] text-rose-900">
                    {duration.duration}
                  </h4>
                  <span className="font-bold font-[poppins] text-rose-700">
                    ₹{duration.price}
                  </span>
                </div>
                {duration.label && (
                  <p className="text-sm text-rose-600 font-[poppins]">
                    {duration.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Calendar className="h-5 w-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold font-[philosopher] text-rose-900">
                Select Date & Time
              </h3>
              <p className="text-sm font-[poppins] text-rose-700">
                Choose your preferred appointment slot
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <label className="block text-sm font-medium mb-3 font-[poppins] text-rose-900">
              Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full text-black p-3 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-[poppins] bg-white/80 transition-all duration-300"
              min={new Date().toISOString().slice(0, 16)}
              value={selectedDateTime}
              onChange={handleDateTimeChange}
            />
            <p className="mt-3 text-sm font-[poppins] text-rose-600 bg-rose-50/50 p-3 rounded-lg">
              📅 Business hours: 9:00 AM - 9:00 PM
            </p>
          </div>
        </div>
        {/* Navigation ke upar ye code add karo */}
        {selectedService?.category?.name?.toLowerCase() === "massage" && (
          <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            💆‍♀️ <strong>Note:</strong> For massage services, you'll be able to
            select a room type in the next step.
          </div>
        )}

        {selectedService?.category?.name?.toLowerCase() !== "massage" && (
          <div className="mt-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            ✅ <strong>Note:</strong> Room selection is not required for this
            service.
          </div>
        )}
        {/* Navigation */}
        <div className="px-6 py-4 bg-rose-50/30 flex flex-col sm:flex-row justify-between gap-3 border-t border-rose-100">
          <button
            onClick={() => setActiveTab("services")}
            className="py-3 px-6 border border-rose-300 text-rose-700 rounded-xl hover:bg-white transition-all duration-300 font-[poppins] font-medium flex items-center justify-center gap-2"
          >
            ← Back to Services
          </button>
          <button
            onClick={handleProceedToRoomSelection}
            disabled={!selectedDuration || !selectedDateTime}
            className={`py-3 px-8 rounded-xl text-white transition-all duration-300 font-[poppins] font-medium flex items-center justify-center gap-2 ${
              !selectedDuration || !selectedDateTime
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-700 to-rose-600 hover:shadow-lg shadow-md hover:from-rose-600 hover:to-rose-500"
            }`}
          >
            Next: Select Room
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
