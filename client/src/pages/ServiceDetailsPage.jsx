import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Star,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ServicesSection from "../components/home/ServicesSection";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/services/${id}`);
        setService(res.data);

        // Set the first pricing option as default
        if (res.data.pricing && res.data.pricing.length > 0) {
          setSelectedPricing(res.data.pricing[0]);
        }

        // Check if service is in user's favorites
        if (user) {
          try {
            const favRes = await api.get(`/favorites/check/${id}`);
            setIsFavorite(favRes.data.isFavorite);
          } catch (err) {
            // Silently fail if favorites check fails
            console.error("Error checking favorites:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        addToast("Failed to load service details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id, user]);

  const handleAddToFavorites = async () => {
    if (!user) {
      addToast("Please login to add favorites", "info");
      navigate("/auth/login");
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        addToast("Removed from favorites", "success");
      } else {
        await api.post(`/favorites`, { service: id });
        setIsFavorite(true);
        addToast("Added to favorites", "success");
      }
    } catch (err) {
      addToast("Failed to update favorites", "error");
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      addToast("Please login to book an appointment", "info");
      navigate("/auth/login", { state: { returnTo: `/service/${id}` } });
      return;
    }

    navigate("/appointment", {
      state: {
        serviceId: id,
        selectedPricing,
      },
    });
  };

  const handleShareService = async () => {
    const shareUrl = `${window.location.origin}/service/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: service.description,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        addToast("Link copied to clipboard", "success");
      } catch (err) {
        addToast("Failed to copy link", "error");
      }
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} Minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} Hour ${remainingMinutes} Minutes`
      : `${hours} Hour${hours > 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Service Not Found
          </h1>
          <Link
            to="/services"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const displayedBenefits = showAllBenefits
    ? service.benefits
    : service.benefits.slice(0, 3);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/appointment"
            className="inline-flex items-center text-rose-700 hover:text-rose-800 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Service Images */}
          <div className="space-y-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/30">
              <div className="relative w-full h-80 overflow-hidden rounded-xl shadow-md">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
                  </div>
                )}
                <img
                  src={service.images?.[0] || "/default-service.jpg"}
                  alt={service.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => setImageLoading(false)}
                />
              </div>
            </div>

            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {service.images.slice(1, 4).map((image, index) => (
                  <div
                    key={index}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-2 border border-white/30"
                  >
                    <img
                      src={image}
                      alt={`${service.name} ${index + 2}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Service Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900 font-[philosopher]">
                  {service.name}
                </h1>
              </div>

              {service.category && (
                <span className="inline-block bg-rose-100 text-rose-800 text-sm font-medium px-3 py-1 rounded-full mb-4 font-[poppins]">
                  {service.category.name}
                </span>
              )}

              <p className="text-gray-600 mb-6 font-[poppins]">
                {service.description}
              </p>

              {/* Rating (if available) */}
              {/* <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-[poppins]">
                  4.8 (124 reviews)
                </span>
              </div> */}

              {/* Pricing Options */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 font-[poppins]">
                  Pricing Options
                </h3>
                <div className="space-y-2">
                  {service.pricing.map((pricingOption, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 font-[poppins] ${
                        selectedPricing === pricingOption
                          ? "border-rose-500 bg-rose-50 shadow-md"
                          : "border-gray-200 hover:border-rose-300 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pricing"
                        value={index}
                        checked={selectedPricing === pricingOption}
                        onChange={() => setSelectedPricing(pricingOption)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">
                            {pricingOption.label || pricingOption.duration}
                          </span>
                          <span className="font-bold text-rose-700">
                            ₹{pricingOption.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDuration(pricingOption.durationMinutes)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                className="w-full bg-gradient-to-r from-rose-700 to-amber-700 text-white py-4 rounded-xl font-semibold hover:from-rose-800 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl font-[poppins] flex items-center justify-center transform hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
            </div>

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[philosopher]">
                  Service Benefits
                </h2>
                <div className="space-y-3">
                  {displayedBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 font-[poppins]">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                {service.benefits.length > 3 && (
                  <button
                    onClick={() => setShowAllBenefits(!showAllBenefits)}
                    className="mt-4 text-rose-700 hover:text-rose-800 font-medium text-sm font-[poppins] inline-flex items-center transition-colors"
                  >
                    {showAllBenefits ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Show All Benefits{" "}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-[philosopher]">
                  Service Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full font-[poppins] hover:bg-rose-100 hover:text-rose-800 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Services Section */}
        <div className="pt-16">
          <ServicesSection />
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
