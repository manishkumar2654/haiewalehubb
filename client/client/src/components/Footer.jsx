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
      "Hello Hair Hub, I'd like to know more about your services."
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
      action: () => handleWhatsApp("9981427186"),
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  // Branch data - compact format
  // const branches = [
  //   {
  //     name: "Gold Branch",
  //     color: "border-amber-500",
  //     bg: "bg-amber-50",
  //     phones: ["9713326656", "9826672020", "0731-4996661"],
  //     address:
  //       "39, Sector-D, Scheme No. 140, in front of overhead water tank 19 No. Zone",
  //   },
  //   {
  //     name: "Diamond Branch",
  //     color: "border-cyan-500",
  //     bg: "bg-cyan-50",
  //     phones: ["9111532020", "9111392020", "0731-4073879"],
  //     address: "540, Greater Brijeshwari, in front of Empire Residency",
  //   },
  //   {
  //     name: "Silver Branch",
  //     color: "border-gray-500",
  //     bg: "bg-gray-50",
  //     phones: ["9111332020", "8821024040", "0731-4964449"],
  //     address: "36, Sector-F-B, Scheme No. 94",
  //   },
  // ];

  // Quick links with icons
  const quickLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/appointment", icon: Scissors },
    { name: "Book Appointments", path: "/appointment", icon: Calendar },
    // { name: "About Us", path: "/about", icon: User },
    // { name: "Contact Us", path: "/contact", icon: Phone },
    // { name: "Terms & Conditions", path: "/terms", icon: Shield },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-rose-50 to-amber-50 relative overflow-hidden">
      {/* Decorative elements - reduced size */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-rose-200/10 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-amber-200/10 blur-xl"></div>
      </div>

      {/* Top Image Banner - reduced height */}
     <section className="relative w-full h-[30vh] min-h-[180px] max-h-[350px] overflow-hidden">
  <img
    src="/hairhubfotter11.png"
    alt="Hair Hub Banner"
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
          </div>

          {/* Bottom Bar - Compact */}
          <div className="border-t border-rose-200/50 mt-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-700 text-xs font-[poppins] text-center md:text-left mb-2 md:mb-0">
                © {new Date().getFullYear()} Hair Hub. All rights reserved.
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
                <a
                  href="https://www.skyinfogroup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-700 ml-1 hover:text-rose-900 font-medium"
                >
                  SkyInfoGroup
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
