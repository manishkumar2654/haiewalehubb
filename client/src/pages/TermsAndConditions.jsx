import React from "react";
import {
  AlertTriangle,
  Clock,
  XCircle,
  Package,
  Shield,
  FileText,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  const policies = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Walk-in Policy",
      description:
        "Walk-in services are subject to availability and prior confirmation.",
      details: [
        "Services are available on a first-come, first-served basis",
        "Priority is given to pre-booked appointments",
        "Availability may vary based on staff schedules",
        "We recommend booking in advance to guarantee your slot",
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Late Arrival",
      description:
        "Late arrival may result in reduced service time without refund.",
      details: [
        "Please arrive 15 minutes before your scheduled appointment",
        "Arrival more than 15 minutes late may result in appointment cancellation",
        "Service time will not be extended for late arrivals",
        "Full appointment charges apply regardless of reduced service time",
      ],
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: "Cancellation Policy",
      description:
        "Cancellations must be informed at least 6 hours in advance.",
      details: [
        "Cancellations within 6 hours incur a 50% cancellation fee",
        "Same-day cancellations are charged in full",
        "Rescheduling is free if done at least 6 hours in advance",
        "To cancel or reschedule, call or WhatsApp us directly",
      ],
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "No-Show Policy",
      description: "No-show appointments will be charged in full.",
      details: [
        "Failure to show up without prior notice results in full charge",
        "Three no-shows may result in booking restrictions",
        "Payment for no-shows must be cleared before future bookings",
        "Emergency exceptions may be considered with valid proof",
      ],
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Package Services",
      description:
        "Packages once purchased are non-refundable and non-transferable.",
      details: [
        "All package sales are final",
        "Packages cannot be transferred to another person",
        "Package validity is as per terms at time of purchase",
        "Expired packages cannot be extended or refunded",
      ],
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Service Results",
      description: "Service results may vary from person to person.",
      details: [
        "Results depend on individual hair/skin type and condition",
        "We use premium products but cannot guarantee identical results",
        "Allergic reactions should be reported immediately",
        "Patch tests are recommended for new treatments",
      ],
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Payment Terms",
      description: "Clear payment policies for all services.",
      details: [
        "All prices are inclusive of GST",
        "Advance payment required for certain premium services",
        "We accept cash, UPI, and credit/debit cards",
        "Receipts will be provided for all payments",
      ],
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Management Rights",
      description:
        "Management reserves the right to modify or cancel any service or offer.",
      details: [
        "We reserve the right to refuse service to anyone",
        "Prices and services are subject to change without notice",
        "Special offers may be modified or withdrawn at any time",
        "In case of emergencies, appointments may need to be rescheduled",
      ],
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  ];

  const generalTerms = [
    "By booking an appointment, you agree to all our terms and conditions",
    "Children under 12 must be accompanied by an adult",
    "We are not responsible for lost or stolen items",
    "Photography/videography may require prior permission",
    "All feedback and complaints should be directed to management",
    "These terms are governed by Indian law",
  ];

  return (
    <div className="min-h-screen pt-10 bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[250px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-rose-900/50 z-10"></div>
        <img
          src="/terms-hero.jpg"
          alt="Terms and Conditions"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[philosopher] mb-4 text-white drop-shadow-lg">
              Terms & Conditions
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto font-[poppins] drop-shadow-md">
              Please read our policies carefully before booking your appointment
            </p>
          </div>
        </div>
      </section>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Important Notice */}
          <div className="mb-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <AlertTriangle className="h-12 w-12" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-[philosopher] font-bold mb-3">
                  Important Notice
                </h2>
                <p className="font-[poppins] text-white/90 leading-relaxed">
                  By booking an appointment or availing any of our services, you
                  acknowledge that you have read, understood, and agree to be
                  bound by all the terms and conditions listed below. These
                  policies are designed to ensure the best experience for all
                  our valued customers.
                </p>
              </div>
            </div>
          </div>

          {/* Main Policies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {policies.map((policy, index) => (
              <div
                key={index}
                className={`${policy.bgColor} rounded-2xl p-6 border ${policy.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-full bg-gradient-to-br ${policy.color} text-white`}
                  >
                    {policy.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-[philosopher] font-bold text-gray-900">
                      {policy.title}
                    </h3>
                    <p className="font-[poppins] text-gray-700 mt-1">
                      {policy.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {policy.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white/50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 mt-2"></div>
                      <p className="font-[poppins] text-gray-700 text-sm">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* General Terms */}
          <div className="mb-16">
            <h2 className="text-3xl font-[philosopher] text-center mb-8 text-rose-900">
              General Terms & Conditions
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-rose-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generalTerms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-rose-700">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <p className="font-[poppins] text-gray-800">{term}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information for Queries */}
          <div className="bg-gradient-to-r from-rose-600 to-amber-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-[philosopher] font-bold mb-4">
                Questions About Our Policies?
              </h2>
              <p className="font-[poppins] mb-6 text-white/90">
                If you have any questions or need clarification about our terms
                and conditions, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="px-6 py-3 bg-white text-rose-900 rounded-full font-[poppins] font-semibold hover:bg-rose-100 transition-colors shadow-lg"
                >
                  Contact Us
                </Link>
                <a
                  href="tel:9713326656"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-[poppins] font-semibold hover:bg-white/30 transition-colors shadow-lg border border-white/30"
                >
                  Call Now: 9713326656
                </a>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-rose-200/50 shadow-sm">
              <Calendar className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-[poppins] text-rose-700">
                Last Updated: December 25, 2025
              </span>
            </div>
            <p className="text-gray-600 font-[poppins] text-sm mt-4">
              These terms and conditions are subject to change. Please check
              this page periodically for updates.
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <div className="text-center py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-rose-700 hover:text-rose-900 font-[poppins] font-semibold transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TermsAndConditions;
