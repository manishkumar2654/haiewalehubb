import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Award,
  Users,
  Scissors,
  Palette,
  Sparkles,
} from "lucide-react";

const AboutUs = () => {
  const locations = [
    {
      name: "Gold",
      address:
        "39, Sector- D, Scheme No. 140, in front of overhead water tank 19 No. Zone",
      phone: ["9713326656", "9826672020"],
      landline: "0731-4996661",
      rooms: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      coupleRooms: 8,
      features: ["Premium 1", "Premium 2", "Premium 3"],
      color: "bg-gradient-to-br from-amber-600 to-yellow-400",
      icon: <Star className="w-6 h-6" />,
    },
    {
      name: "Diamond",
      address: "540, Greater Brijeshwari, in front of Empire Residency",
      phone: ["9111532020", "9111392020"],
      landline: "0731-4073879",
      rooms: ["1", "2", "3", "4"],
      coupleRooms: 5,
      features: ["VIP Lounge", "Private Suite"],
      color: "bg-gradient-to-br from-cyan-600 to-blue-400",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      name: "Silver",
      address: "36, Sector- F-B, Scheme No. 94",
      phone: ["9111332020", "8821024040"],
      landline: "0731-4964449",
      rooms: ["1", "2", "3", "4", "5", "6", "7", "8"],
      coupleRooms: 0,
      features: ["Standard Rooms", "Economy Package"],
      color: "bg-gradient-to-br from-gray-600 to-slate-300",
      icon: <Award className="w-6 h-6" />,
    },
  ];

  const services = [
    {
      name: "Premium SPA",
      description:
        "Luxurious spa treatments with traditional and modern techniques",
      icon: <Sparkles className="w-8 h-8" />,
      color: "text-amber-600",
    },
    {
      name: "Bridal Makeup",
      description: "Complete bridal packages with professional artists",
      icon: <Palette className="w-8 h-8" />,
      color: "text-rose-600",
    },
    {
      name: "Hair Styling",
      description: "Trendy haircuts, coloring, and styling services",
      icon: <Scissors className="w-8 h-8" />,
      color: "text-purple-600",
    },
    {
      name: "Skin Care",
      description: "Advanced facials and skin rejuvenation treatments",
      icon: <Users className="w-8 h-8" />,
      color: "text-emerald-600",
    },
  ];

  const stats = [
    {
      value: "10+",
      label: "Years Experience",
      icon: <Award className="w-6 h-6" />,
    },
    {
      value: "3",
      label: "Premium Locations",
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      value: "25+",
      label: "Expert Staff",
      icon: <Users className="w-6 h-6" />,
    },
    {
      value: "5000+",
      label: "Happy Clients",
      icon: <Star className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-900/70 to-amber-900/50 z-10"></div>
        <img
          src="/spa-hero.jpg"
          alt="Luxury SPA and Salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[philosopher] mb-6 text-white drop-shadow-lg">
              About Our Luxury SPA
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto font-[poppins] drop-shadow-md">
              Experience premium beauty and wellness services at our three
              luxurious locations
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Introduction */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-[philosopher] mb-6 text-rose-900">
              Welcome to Our Premium SPA & Makeup Salon
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-amber-400 mx-auto mb-8"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-[poppins] mb-6">
              We are a premier beauty and wellness destination offering
              luxurious spa treatments, professional makeup services, and
              complete salon experiences. With three strategically located
              branches across the city, we bring premium services closer to you.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-[poppins]">
              Our team of certified professionals is dedicated to providing
              exceptional service using only the finest products and latest
              techniques in the industry.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/30"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-rose-100 to-amber-100">
                    <div className="text-rose-900">{stat.icon}</div>
                  </div>
                </div>
                <div className="text-3xl font-bold font-[philosopher] text-rose-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-[poppins]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="mb-16">
            <h3 className="text-3xl font-[philosopher] text-center mb-12 text-rose-900">
              Our Premium Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className={`mb-4 ${service.color}`}>{service.icon}</div>
                  <h4 className="text-xl font-[philosopher] font-semibold mb-3 text-rose-900">
                    {service.name}
                  </h4>
                  <p className="text-gray-600 font-[poppins]">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="mb-16">
            <h3 className="text-3xl font-[philosopher] text-center mb-12 text-rose-900">
              Our Locations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {locations.map((location, index) => (
                <div
                  key={index}
                  className={`rounded-2xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105`}
                >
                  {/* Header */}
                  <div className={`${location.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl font-[philosopher] font-bold">
                        {location.name} Branch
                      </h4>
                      <div className="text-white/90">{location.icon}</div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-[poppins] text-sm">
                        {location.address}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-white p-6">
                    {/* Contact Info */}
                    <div className="mb-6">
                      <h5 className="font-[poppins] font-semibold text-gray-800 mb-3">
                        Contact Information
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-rose-700" />
                          <span className="font-[poppins] text-gray-700">
                            {location.landline} (Landline)
                          </span>
                        </div>
                        {location.phone.map((phone, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 ml-6"
                          >
                            <Phone className="w-4 h-4 text-rose-700" />
                            <span className="font-[poppins] text-gray-700">
                              {phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="mb-6">
                      <h5 className="font-[poppins] font-semibold text-gray-800 mb-3">
                        Facilities
                      </h5>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {location.rooms.map((room) => (
                          <span
                            key={room}
                            className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-[poppins]"
                          >
                            Room {room}
                          </span>
                        ))}
                      </div>
                      {location.coupleRooms > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-rose-700" />
                          <span className="font-[poppins] text-gray-700">
                            {location.coupleRooms} Couple Room
                            {location.coupleRooms > 1 ? "s" : ""} Available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {location.features.length > 0 && (
                      <div>
                        <h5 className="font-[poppins] font-semibold text-gray-800 mb-3">
                          Special Features
                        </h5>
                        <ul className="space-y-1">
                          {location.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="font-[poppins] text-gray-700">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-gradient-to-r from-rose-900 to-amber-800 rounded-2xl p-8 text-center shadow-2xl mb-16">
            <h3 className="text-2xl font-[philosopher] text-white mb-4">
              Have Questions? Get in Touch!
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white" />
                <a
                  href="mailto:statsaya5353@gmail.com"
                  className="text-white font-[poppins] hover:text-amber-200 transition-colors"
                >
                  statsaya5353@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-white font-[poppins]">
                  Open Daily: 9:00 AM - 9:00 PM
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                (window.location.href = "mailto:statsaya5353@gmail.com")
              }
              className="mt-6 px-8 py-3 bg-white text-rose-900 rounded-full font-[poppins] font-semibold hover:bg-amber-100 transition-colors shadow-lg"
            >
              Book an Appointment
            </button>
          </div>

          {/* Mission Statement */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h3 className="text-2xl font-[philosopher] text-center mb-6 text-rose-900">
              Our Commitment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-[philosopher] font-semibold mb-4 text-rose-800">
                  Our Mission
                </h4>
                <p className="text-gray-700 font-[poppins]">
                  To provide exceptional beauty and wellness services in a
                  luxurious environment, using premium products and skilled
                  professionals. We strive to make every client feel special and
                  leave our spa feeling refreshed and beautiful.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-[philosopher] font-semibold mb-4 text-rose-800">
                  Why Choose Us
                </h4>
                <ul className="space-y-3">
                  {[
                    "Certified and experienced professionals",
                    "Hygienic and sanitized environment",
                    "Premium quality products",
                    "Multiple convenient locations",
                    "Personalized service for every client",
                    "Affordable luxury packages",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                      <span className="text-gray-700 font-[poppins]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-rose-900 to-amber-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-[philosopher] mb-4">
              Luxury SPA & Makeup Salon
            </h4>
            <p className="font-[poppins] mb-4">
              Three Premium Locations • Gold • Diamond • Silver
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="font-[poppins]">statsaya5353@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-[poppins]">
                  Call: 9713326656 / 9826672020
                </span>
              </div>
            </div>
            <p className="font-[poppins] text-white/80 text-sm">
              © {new Date().getFullYear()} Luxury SPA & Makeup Salon. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&family=Poppins:wght@300;400;500;600&display=swap");
      `}</style>
    </div>
  );
};

export default AboutUs;
