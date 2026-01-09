import React from "react";

const AppointmentSteps = ({
  activeTab,
  selectedService,
  selectedDuration,
  selectedDateTime,
  setActiveTab,
}) => {
  return (
    <>
      {/* Mobile Navigation - Steps */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center justify-between px-4">
          <div
            className={`flex flex-col items-center ${
              activeTab === "services" ? "text-rose-900" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "services"
                  ? "bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 text-white"
                  : "bg-white/90"
              }`}
            >
              {activeTab === "services" ? (
                <span className="font-bold">1</span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs mt-1 font-[poppins]">Services</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-px w-full bg-gray-300"></div>
          </div>

          <div
            className={`flex flex-col items-center ${
              activeTab === "datetime-selection"
                ? "text-rose-900"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "datetime-selection"
                  ? "bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 text-white"
                  : "bg-white/90"
              }`}
            >
              {activeTab === "datetime-selection" ? (
                <span className="font-bold">2</span>
              ) : activeTab === "room-selection" ||
                activeTab === "confirmation" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="font-bold">2</span>
              )}
            </div>
            <span className="text-xs mt-1 font-[poppins]">Time</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-px w-full bg-gray-300"></div>
          </div>

          <div
            className={`flex flex-col items-center ${
              activeTab === "room-selection" ? "text-rose-900" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "room-selection"
                  ? "bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 text-white"
                  : "bg-white/90"
              }`}
            >
              {activeTab === "room-selection" ? (
                <span className="font-bold">3</span>
              ) : activeTab === "confirmation" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="font-bold">3</span>
              )}
            </div>
            <span className="text-xs mt-1 font-[poppins]">Room</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-px w-full bg-gray-300"></div>
          </div>

          <div
            className={`flex flex-col items-center ${
              activeTab === "confirmation" ? "text-rose-900" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "confirmation"
                  ? "bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 text-white"
                  : "bg-white/90"
              }`}
            >
              <span className="font-bold">4</span>
            </div>
            <span className="text-xs mt-1 font-[poppins]">Confirm</span>
          </div>
        </div>
      </div>

      {/* Desktop Navigation - Tabs */}
      <div className="hidden sm:block mb-8">
        <div className="flex justify-center">
          <nav className="flex space-x-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-md border border-white/30">
            <button
              onClick={() => setActiveTab("services")}
              className={`px-5 py-2 rounded-lg text-sm font-[poppins] ${
                activeTab === "services"
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : "text-rose-900 hover:bg-rose-50"
              } transition-all duration-300`}
            >
              Select Service
            </button>
            <button
              onClick={() =>
                selectedService && setActiveTab("datetime-selection")
              }
              disabled={!selectedService}
              className={`px-5 py-2 rounded-lg text-sm font-[poppins] ${
                activeTab === "datetime-selection"
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : !selectedService
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-rose-900 hover:bg-rose-50"
              } transition-all duration-300`}
            >
              Select Time
            </button>
            {/* Line 167 ke baad - "Select Room Type" button update karo */}
            <button
              onClick={() => {
                if (selectedDuration && selectedDateTime) {
                  // Check if selected service is massage
                  const isMassage =
                    selectedService?.category?.name?.toLowerCase() ===
                    "massage";

                  if (isMassage) {
                    // Massage service hai to room selection pe jao
                    setActiveTab("room-selection");
                  } else {
                    // Non-massage service hai to summary ya customer details pe jao
                    // (Yeh logic frontend se determine hoga)
                    setActiveTab("summary"); // Ya appropriate tab
                  }
                }
              }}
              disabled={!selectedDuration || !selectedDateTime}
              className={`px-5 py-2 rounded-lg text-sm font-[poppins] ${
                activeTab === "room-selection"
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : !selectedDuration || !selectedDateTime
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-rose-900 hover:bg-rose-50"
              } transition-all duration-300`}
            >
              Select Room Type
            </button>
            <button
              disabled={activeTab !== "confirmation"}
              className={`px-5 py-2 rounded-lg text-sm font-[poppins] ${
                activeTab === "confirmation"
                  ? "text-white shadow-lg bg-[length:300%_300%] bg-gradient-to-r from-rose-900 via-stone-400 to-rose-900 animate-gradient-flow"
                  : "text-gray-400 cursor-not-allowed"
              } transition-all duration-300`}
            >
              Confirmation
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AppointmentSteps;
