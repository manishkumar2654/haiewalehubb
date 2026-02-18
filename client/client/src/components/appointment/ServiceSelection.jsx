import React from "react";
import { Clock, Eye, Sparkles } from "lucide-react";

const ServiceSelection = ({
  categories,
  filteredServices,
  loading,
  selectedCategory,
  handleSelectCategory,
  handleSelectService,
  handleViewServiceDetails,
}) => {
  return (
    <div className="space-y-8 px-2">
      {/* Enhanced Category Filter */}
      <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide mb-6 px-2">
        <button
          onClick={() => handleSelectCategory(null)}
          className={`px-5 py-2.5 rounded-full text-sm font-[poppins] transition-all duration-300 min-w-max border ${
            !selectedCategory
              ? "text-white shadow-lg bg-gradient-to-r from-rose-700 to-rose-600 border-rose-600"
              : "bg-white/90 text-rose-800 border-rose-200 hover:bg-white hover:border-rose-300 shadow-sm"
          }`}
        >
          All Treatments
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleSelectCategory(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-[poppins] transition-all duration-300 min-w-max border ${
              selectedCategory?._id === category._id
                ? "text-white shadow-lg bg-gradient-to-r from-rose-700 to-rose-600 border-rose-600"
                : "bg-white/90 text-rose-800 border-rose-200 hover:bg-white hover:border-rose-300 shadow-sm"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-rose-700 font-[poppins]">Loading services...</p>
          </div>
        </div>
      )}

      {/* Services Grid */}
      {!loading && filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl max-w-md mx-auto p-8 shadow-lg border border-white/30">
          <svg
            className="mx-auto h-16 w-16 text-rose-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-medium font-[poppins] text-rose-900">
            No services found
          </h3>
          <p className="mt-2 font-[poppins] text-gray-600">
            {selectedCategory
              ? `No services available in ${selectedCategory.name} category`
              : "No services available at the moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service._id}
              className="flex-shrink-0 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 bg-white/90 backdrop-blur-sm hover:-translate-y-1 group"
            >
              {/* Service Image */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.images?.[0] || "/default-service.jpg"}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-[poppins] text-white">
                    {service.category?.name}
                  </span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewServiceDetails(service._id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all duration-300 hover:scale-110"
                  title="View Service Details"
                >
                  <Eye className="w-4 h-4 text-rose-700" />
                </button>
              </div>

              {/* Service Content */}
              <div className="p-5">
                <h3 className="text-lg font-[poppins] font-semibold mb-3 text-rose-900 line-clamp-2">
                  {service.name}
                </h3>

                <div className="space-y-3 mb-4">
                  {service.pricing?.slice(0, 2).map((price, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-rose-50/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center font-[poppins] text-sm text-rose-800">
                        <Clock className="h-4 w-4 mr-2 text-rose-600" />
                        {price.duration}
                      </div>
                      <span className="font-[poppins] text-sm font-semibold text-rose-700">
                        ₹{price.price}
                      </span>
                    </div>
                  ))}

                  {service.pricing?.length > 2 && (
                    <div className="text-center">
                      <span className="text-xs text-rose-600 font-[poppins] font-medium bg-rose-50 px-3 py-1 rounded-full">
                        +{service.pricing.length - 2} more options
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewServiceDetails(service._id)}
                    className="flex-1 font-[poppins] text-sm py-2.5 bg-white border border-rose-700 text-rose-700 rounded-lg hover:bg-rose-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  <button
                    onClick={() => handleSelectService(service)}
                    className="flex-1 font-[poppins] text-sm py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 shadow-md hover:from-rose-600 hover:to-rose-500 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;
