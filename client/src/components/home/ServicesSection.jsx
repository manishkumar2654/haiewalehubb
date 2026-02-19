import React, { useState, useEffect, useRef } from "react";
import { Clock, Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import api from "../../services/api";

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollContainerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes] = await Promise.all([
          api.get("/admin/services"),
          api.get("/admin/categories"),
        ]);

        const validServices = servicesRes.data.filter(
          (s) => s.category && (typeof s.category === "string" || s.category._id)
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
          service.category._id === category._id || service.category === category._id
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const getDisplayPricing = (pricing) => {
    if (!pricing || pricing.length === 0) return [{ duration: "Standard", price: 0 }];
    return pricing.slice(0, 3);
  };

  const getMainPrice = (pricing) => {
    if (!pricing || pricing.length === 0) return 0;
    return Math.min(...pricing.map((p) => p.price));
  };

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Premium background texture + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(120,113,108,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-24 -right-24 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-rose-300/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/60 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]">
            <Sparkles className="h-4 w-4 text-rose-700" />
            <span className="text-xs sm:text-sm font-[poppins] text-rose-800 font-semibold tracking-wide">
              Luxury Hair Salon Services
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-[philosopher] mb-3 text-rose-950 tracking-wide">
            {location.pathname === "/" ? "OUR SERVICES" : "EXPLORE SERVICES"}
          </h2>

          <div className="w-24 h-[3px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 mx-auto rounded-full shadow-sm" />

          <p className="mt-4 text-gray-600 font-[poppins] text-sm sm:text-[15px] max-w-2xl mx-auto leading-relaxed">
            Discover our exclusive range of premium treatments crafted for radiant
            beauty, comfort, and a truly elevated salon experience.
          </p>
        </div>

        {/* Premium Category Pills */}
        <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide mb-8 px-1">
          <button
            onClick={() => handleSelectCategory(null)}
            className={`px-5 py-2.5 rounded-full text-xs font-[poppins] transition-all duration-300 min-w-max border ${
              !selectedCategory
                ? "text-white bg-gradient-to-r from-rose-800 to-rose-600 border-rose-700 shadow-[0_12px_28px_-16px_rgba(190,18,60,0.6)]"
                : "bg-white/70 backdrop-blur-xl text-rose-900 border-white/60 hover:bg-white hover:shadow-[0_12px_28px_-20px_rgba(0,0,0,0.45)]"
            }`}
          >
            All Treatments
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleSelectCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-[poppins] transition-all duration-300 min-w-max border ${
                selectedCategory?._id === category._id
                  ? "text-white bg-gradient-to-r from-rose-800 to-rose-600 border-rose-700 shadow-[0_12px_28px_-16px_rgba(190,18,60,0.6)]"
                  : "bg-white/70 backdrop-blur-xl text-rose-900 border-white/60 hover:bg-white hover:shadow-[0_12px_28px_-20px_rgba(0,0,0,0.45)]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Services Display */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-2xl max-w-md mx-auto p-7 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.55)] border border-white/60">
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
            <h3 className="mt-3 text-lg font-semibold font-[poppins] text-rose-950">
              No services found
            </h3>
            <p className="mt-1 font-[poppins] text-gray-600 text-sm leading-relaxed">
              {selectedCategory
                ? `No services available in ${selectedCategory.name} category`
                : "No services available at the moment"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Premium Nav Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center
                         bg-white/70 backdrop-blur-xl p-2.5 rounded-full
                         border border-white/60 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.6)]
                         hover:bg-white transition-all duration-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-rose-800" />
            </button>

            <button
              onClick={scrollRight}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center
                         bg-white/70 backdrop-blur-xl p-2.5 rounded-full
                         border border-white/60 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.6)]
                         hover:bg-white transition-all duration-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-rose-800" />
            </button>

            {/* Scrollable Cards */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-7 -mx-3 px-3 scrollbar-hide"
            >
              <div className="flex space-x-6">
                {filteredServices.map((service) => (
                  <div
                    key={service._id}
                    className="flex-shrink-0 w-72 sm:w-[300px] rounded-2xl overflow-hidden
                               bg-white/65 backdrop-blur-xl border border-white/60
                               shadow-[0_22px_60px_-38px_rgba(0,0,0,0.65)]
                               hover:shadow-[0_28px_70px_-40px_rgba(0,0,0,0.75)]
                               transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="h-52 overflow-hidden relative group">
                      <img
                        src={service.images?.[0] || "/default-service.jpg"}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Premium overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/75 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/70 shadow-sm">
                        <span className="text-xs font-[poppins] font-bold text-rose-800 tracking-wide">
                          From ₹{getMainPrice(service.pricing)}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20">
                        <span className="text-xs font-[poppins] text-white/95 tracking-wide">
                          {service.category?.name || "Service"}
                        </span>
                      </div>

                      {/* Subtle bottom highlight line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400/70 via-amber-300/70 to-rose-400/70" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-[15px] font-[poppins] font-semibold mb-3 text-rose-950 line-clamp-1 tracking-wide">
                        {service.name}
                      </h3>

                      {/* Pricing */}
                      <div className="space-y-2.5 mb-5">
                        {getDisplayPricing(service.pricing).map((price, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center rounded-xl px-3.5 py-2.5
                                       bg-white/60 border border-white/60
                                       shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                          >
                            <div className="flex items-center font-[poppins] text-xs text-rose-900">
                              <Clock className="h-3.5 w-3.5 mr-2 text-rose-700" />
                              {price.duration || `${price.durationMinutes} min`}
                            </div>
                            <span className="font-[poppins] text-xs font-bold text-rose-800 tracking-wide">
                              ₹{price.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link to={`/service/${service._id}`} className="flex-1">
                          <button
                            className="w-full font-[poppins] text-xs py-3 rounded-xl transition-all duration-300
                                       bg-gradient-to-r from-rose-800 to-amber-600 text-white
                                       shadow-[0_16px_40px_-26px_rgba(190,18,60,0.75)]
                                       hover:shadow-[0_18px_45px_-28px_rgba(190,18,60,0.9)]
                                       hover:from-rose-700 hover:to-amber-500"
                          >
                            Details
                          </button>
                        </Link>
                      </div>

                      {/* Tiny premium divider */}
                      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-rose-200/80 to-transparent" />
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-[poppins] text-gray-500">
                        <Star className="h-3 w-3 text-amber-500" />
                        Premium Care • Trusted Stylists
                        <Star className="h-3 w-3 text-amber-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Scroll Dots */}
            <div className="flex justify-center mt-3 space-x-1.5">
              {filteredServices.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-rose-400/60 to-amber-400/60"
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA (kept commented as-is) */}
        <div className="text-center mt-10">{/* ... */}</div>
      </div>
    </section>
  );
};

export default ServicesSection;
