import React, { useState, useEffect } from "react";
import { Clock, Star, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollContainerRef = React.useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          api.get("/admin/services"),
          api.get("/admin/categories"),
        ]);

        // Make sure all services have a valid category
        const validServices = servicesRes.data.filter(
          (s) =>
            s.category && (typeof s.category === "string" || s.category._id)
        );

        setServices(validServices);
        setFilteredServices(validServices);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };
    fetchData();
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    if (category) {
      const filtered = services.filter(
        (service) =>
          service.category._id === category._id ||
          service.category === category._id
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  // Helper function to get display pricing (max 3 prices)
  const getDisplayPricing = (pricing) => {
    if (!pricing || pricing.length === 0) {
      return [{ duration: "Standard", price: 0 }];
    }

    // Return only first 3 pricing options for consistent layout
    return pricing.slice(0, 3);
  };

  // Helper function to get main price for display
  const getMainPrice = (pricing) => {
    if (!pricing || pricing.length === 0) return 0;
    // Return the lowest price or first price
    return Math.min(...pricing.map((p) => p.price));
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Enhanced decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-rose-200/30 blur-xl"></div>
        <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-amber-200/30 blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 rounded-full bg-rose-300/20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-amber-300/20 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Improved Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-rose-200/50 shadow-sm">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-[poppins] text-rose-700 font-medium">
              Premium Services
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-[philosopher] mb-3 text-rose-900">
            {location.pathname === "/" ? "OUR SERVICES" : "EXPLORE SERVICES"}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-rose-400 to-amber-400 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 font-[poppins] text-sm max-w-2xl mx-auto">
            Discover our exclusive range of spa treatments designed for ultimate
            relaxation and rejuvenation
          </p>
        </div>

        {/* Enhanced Category Filter */}
        <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide mb-8 px-2">
          <button
            onClick={() => handleSelectCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-[poppins] transition-all duration-300 min-w-max border ${
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
              className={`px-4 py-2 rounded-full text-xs font-[poppins] transition-all duration-300 min-w-max border ${
                selectedCategory?._id === category._id
                  ? "text-white shadow-lg bg-gradient-to-r from-rose-700 to-rose-600 border-rose-600"
                  : "bg-white/90 text-rose-800 border-rose-200 hover:bg-white hover:border-rose-300 shadow-sm"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Services Display */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl max-w-md mx-auto p-6 shadow-lg border border-white/30">
            <svg
              className="mx-auto h-12 w-12 text-rose-700"
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
            <h3 className="mt-3 text-lg font-medium font-[poppins] text-rose-900">
              No services found
            </h3>
            <p className="mt-1 font-[poppins] text-gray-600 text-sm">
              {selectedCategory
                ? `No services available in ${selectedCategory.name} category`
                : "No services available at the moment"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden sm:flex items-center justify-center border border-rose-200 hover:shadow-xl"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-rose-700" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden sm:flex items-center justify-center border border-rose-200 hover:shadow-xl"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-rose-700" />
            </button>

            {/* Scrollable Services Cards */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-6 -mx-3 px-3 scrollbar-hide"
            >
              <div className="flex space-x-5">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="flex-shrink-0 w-64 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 bg-white/90 backdrop-blur-sm hover:-translate-y-1"
                  >
                    {/* Card Image */}
                    <div className="h-48 overflow-hidden relative group">
                      <img
                        src={service.images?.[0] || "/default-service.jpg"}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                        <span className="text-xs font-[poppins] font-bold text-rose-700">
                          From ₹{getMainPrice(service.pricing)}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                        <span className="text-xs font-[poppins] text-white">
                          {service.category?.name || "Service"}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Service Name */}
                      <h3 className="text-base font-[poppins] font-semibold mb-2 text-rose-900 line-clamp-1">
                        {service.name}
                      </h3>

                      {/* Pricing - Consistent 3 items max */}
                      <div className="space-y-2 mb-4">
                        {getDisplayPricing(service.pricing).map(
                          (price, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-rose-50/50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center font-[poppins] text-xs text-rose-800">
                                <Clock className="h-3 w-3 mr-2 text-rose-600" />
                                {price.duration ||
                                  `${price.durationMinutes} min`}
                              </div>
                              <span className="font-[poppins] text-xs font-semibold text-rose-700">
                                ₹{price.price}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link to={`/appointment`} className="flex-1">
                          <button className="w-full font-[poppins] text-xs py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 shadow-md hover:from-rose-600 hover:to-rose-500">
                            Book Now
                          </button>
                        </Link>
                        <Link to={`/service/${service._id}`} className="flex-1">
                          <button className="w-full font-[poppins] text-xs py-2.5 bg-white border border-rose-700 text-rose-700 rounded-lg hover:bg-rose-700 hover:text-white transition-all duration-300 shadow-sm">
                            Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-4 space-x-1">
              {filteredServices.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-rose-300/60"
                ></div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link to="/appointment">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-700 to-amber-600 text-white font-[poppins] text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-rose-600 hover:to-amber-500">
              <Star className="h-4 w-4" />
              View All Services
              <Star className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
