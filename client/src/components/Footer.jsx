import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  Home,
  Scissors,
  Calendar,
  User,
  Shield,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  // Contact functions
  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (phoneNumber) => {
    const message = encodeURIComponent(
      "Hello S.Tatsaya, I'd like to know more about your services."
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  // Social links data
  const socialLinks = [
    {
      icon: Facebook,
      url: "https://facebook.com",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Instagram,
      url: "https://instagram.com",
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
    {
      icon: MessageCircle,
      action: () => handleWhatsApp("9713326656"),
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  // Branch data - compact format
  const branches = [
    {
      name: "Gold Branch",
      color: "border-amber-500",
      bg: "bg-amber-50",
      phones: ["9713326656", "9826672020", "0731-4996661"],
      address:
        "39, Sector-D, Scheme No. 140, in front of overhead water tank 19 No. Zone",
    },
    {
      name: "Diamond Branch",
      color: "border-cyan-500",
      bg: "bg-cyan-50",
      phones: ["9111532020", "9111392020", "0731-4073879"],
      address: "540, Greater Brijeshwari, in front of Empire Residency",
    },
    {
      name: "Silver Branch",
      color: "border-gray-500",
      bg: "bg-gray-50",
      phones: ["9111332020", "8821024040", "0731-4964449"],
      address: "36, Sector-F-B, Scheme No. 94",
    },
  ];

  // Quick links with icons
  const quickLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/appointment", icon: Scissors },
    { name: "Book Appointments", path: "/appointment", icon: Calendar },
    { name: "About Us", path: "/about", icon: User },
    { name: "Contact Us", path: "/contact", icon: Phone },
    { name: "Terms & Conditions", path: "/terms", icon: Shield },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-rose-50 to-amber-50 relative overflow-hidden">
      {/* Decorative elements - reduced size */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-rose-200/10 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-amber-200/10 blur-xl"></div>
      </div>

      {/* Top Image Banner - reduced height */}
      <section className="relative w-full h-[6vh] min-h-[60px] max-h-[80px] overflow-hidden">
        <img
          src="/footerimg.png"
          alt="Spa treatment"
          className="w-full h-full object-cover object-center"
        />
      </section>

      {/* Main Content - reduced padding */}
      <div className="relative py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Logo and Description - col-span-2 */}
            <div className="md:col-span-1 lg:col-span-2">
              <div className="flex items-start mb-4">
                {/* <img
                  src="/bill/stlogo.png"
                  alt="Salon Logo"
                  className="h-12 w-auto"
                /> */}
                <div className="ml-3">
                  <span className="text-3xl font-[philosopher] font-bold block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-900 to-amber-700">
                      Hair Hub
                    </span>
                  </span>
                  <p className="text-gray-700 text-xs mt-1 leading-relaxed font-[poppins]">
                    Experience luxury and relaxation at our premium spa with
                    expert therapists.
                  </p>
                </div>
              </div>

              {/* Contact Row - Compact */}
              {/* <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                  <Mail className="h-4 w-4 text-rose-900 mr-2" />
                  <a
                    href="mailto:statsaya5353@gmail.com"
                    className="text-xs text-gray-700 font-[poppins] hover:text-rose-900 transition-colors truncate"
                    title="statsaya5353@gmail.com"
                  >
                    statsaya5353@gmail.com
                  </a>
                </div>

                <div className="flex items-center bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                  <Clock className="h-4 w-4 text-rose-900 mr-2" />
                  <span className="text-xs font-semibold text-gray-700 font-[poppins]">
                    9AM - 9PM
                  </span>
                </div>
              </div> */}

              {/* Social Media - Compact */}
              <div className="flex space-x-2 mt-4">
                {socialLinks.map((social, index) => (
                  <button
                    key={index}
                    onClick={social.action}
                    className={`p-2 ${social.bg} rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110`}
                    title={social.icon.name}
                  >
                    <social.icon className={`h-4 w-4 ${social.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links - Compact */}
            <div className="md:col-span-1">
              <h3 className="text-base font-[philosopher] font-semibold mb-3 text-rose-900">
                Quick Links
              </h3>
              <div className="space-y-1.5">
                {quickLinks.slice(0, 5).map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center text-gray-700 hover:text-rose-900 font-[poppins] text-sm transition-colors duration-300 py-1 group"
                  >
                    <link.icon className="h-3 w-3 mr-2 opacity-60 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info - Compact Cards */}
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-base font-[philosopher] font-semibold mb-3 text-rose-900">
                Contact Branches
              </h3>

              {/* Collapsible Branch Cards */}
              <div className="space-y-2">
                {branches.map((branch, index) => (
                  <div
                    key={index}
                    className={`${branch.bg} p-3 rounded-lg shadow-sm border-l-4 ${branch.color} hover:shadow-md transition-shadow duration-300`}
                  >
                    <h4 className="font-[poppins] font-semibold text-gray-800 text-sm mb-1.5">
                      {branch.name}
                    </h4>

                    {/* Phone Numbers - Horizontal Layout */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {branch.phones.map((phone, phoneIndex) => (
                        <button
                          key={phoneIndex}
                          onClick={() => handleCall(phone)}
                          className="text-xs bg-white px-2 py-0.5 rounded text-gray-700 hover:text-rose-900 font-[poppins] transition-colors border border-gray-200 hover:border-rose-200"
                        >
                          {phone}
                        </button>
                      ))}
                    </div>

                    {/* Address - Truncated */}
                    <div className="flex items-start">
                      <MapPin className="h-3 w-3 text-gray-500 mr-1.5 mt-0.5 flex-shrink-0" />
                      <p
                        className="text-xs text-gray-600 font-[poppins] truncate"
                        title={branch.address}
                      >
                        {branch.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Contact Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => handleCall("9713326656")}
                  className="flex-1 min-w-[120px] bg-rose-600 text-white px-3 py-1.5 rounded-lg text-sm font-[poppins] hover:bg-rose-700 transition-colors flex items-center justify-center"
                >
                  <Phone className="h-3 w-3 mr-1.5" />
                  Call Now
                </button>
                <button
                  onClick={() => handleWhatsApp("9713326656")}
                  className="flex-1 min-w-[120px] bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-[poppins] hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="h-3 w-3 mr-1.5" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Compact */}
          <div className="border-t border-rose-200/50 mt-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-700 text-xs font-[poppins] text-center md:text-left mb-2 md:mb-0">
                © {new Date().getFullYear()} S.Tatsaya Spa & Salon. All rights
                reserved.
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {quickLinks.slice(5).map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-700 hover:text-rose-900 text-xs font-[poppins] transition-colors duration-300 flex items-center"
                  >
                    <link.icon className="h-3 w-3 mr-1 opacity-60" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Developer Credit - Minimal */}
            <div className="text-center mt-3">
              <p className="text-xs text-gray-500 font-[poppins]">
                Crafted with ❤️ by{"Aman Raj "} available at{" 9142459858"}
                <a
                  href="https://labs.visionary10x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-700 ml-1 hover:text-rose-900 font-medium"
                >
                  Visionary10X Team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Accent - Thinner */}
      <div className="h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600"></div>
    </footer>
  );
};

export default Footer;
