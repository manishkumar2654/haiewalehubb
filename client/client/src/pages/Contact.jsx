import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  User,
  Mail as MailIcon,
  AlertCircle,
} from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    branch: "Gold",
    service: "SPA",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const branches = [
    {
      name: "Gold",
      address:
        "39, Sector- D, Scheme No. 140, in front of overhead water tank 19 No. Zone",
      phone: ["9713326656", "9826672020"],
      landline: "0731-4996661",
      workingHours: "9:00 AM - 9:00 PM",
      rooms: "10 Rooms + 8 Couple Rooms",
      premium: true,
      color: "bg-gradient-to-br from-amber-600 to-yellow-400",
    },
    {
      name: "Diamond",
      address: "540, Greater Brijeshwari, in front of Empire Residency",
      phone: ["9111532020", "9111392020"],
      landline: "0731-4073879",
      workingHours: "9:00 AM - 9:00 PM",
      rooms: "4 Rooms + 5 Couple Rooms",
      premium: true,
      color: "bg-gradient-to-br from-cyan-600 to-blue-400",
    },
    {
      name: "Silver",
      address: "36, Sector- F-B, Scheme No. 94",
      phone: ["9111332020", "8821024040"],
      landline: "0731-4964449",
      workingHours: "9:00 AM - 9:00 PM",
      rooms: "8 Rooms",
      premium: false,
      color: "bg-gradient-to-br from-gray-600 to-slate-300",
    },
  ];

  const services = [
    "SPA Services",
    "Bridal Makeup",
    "Hair Styling",
    "Skin Care",
    "Nail Art",
    "Waxing",
    "Facial",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      branch: "Gold",
      service: "SPA",
    });

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = (phoneNumber) => {
    const message = encodeURIComponent(
      "Hello, I'm interested in your SPA/Makeup services. Can you provide more information?"
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-rose-900/50 z-10"></div>
        <img
          src="/contact-hero.jpg"
          alt="Contact Us - Luxury SPA"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[philosopher] mb-6 text-white drop-shadow-lg">
              Get in Touch
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto font-[poppins] drop-shadow-md">
              Connect with us for appointments, inquiries, or feedback
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Contact Cards - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {branches.map((branch, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 ${branch.color}`}
              >
                <div className="p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-[philosopher] font-bold">
                      {branch.name} Branch
                    </h3>
                    {branch.premium && (
                      <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-[poppins]">
                        Premium
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="font-[poppins] text-sm leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-[poppins] text-sm">
                          {branch.landline} (Landline)
                        </p>
                        {branch.phone.map((phone, idx) => (
                          <p key={idx} className="font-[poppins] text-sm ml-4">
                            {phone}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <p className="font-[poppins] text-sm">
                        {branch.workingHours}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/30">
                      <p className="font-[poppins] text-sm opacity-90">
                        Facilities: {branch.rooms}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleCall(branch.phone[0])}
                      className="flex-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-[poppins] text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button
                      onClick={() => handleWhatsApp(branch.phone[0])}
                      className="flex-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-[poppins] text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form and Info - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
              <h2 className="text-3xl font-[philosopher] mb-6 text-amber-900">
                Send Us a Message
              </h2>

              {submitSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-[poppins]">
                      Thank you! We'll contact you shortly.
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-[poppins] text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block font-[poppins] text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-[poppins] text-gray-700 mb-2">
                    <MailIcon className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-[poppins] text-gray-700 mb-2">
                      Preferred Branch
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all bg-white"
                    >
                      {branches.map((branch, idx) => (
                        <option key={idx} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-[poppins] text-gray-700 mb-2">
                      Service Interested In
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all bg-white"
                    >
                      {services.map((service, idx) => (
                        <option key={idx} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-[poppins] text-gray-700 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-[poppins] transition-all"
                    placeholder="Please share your requirements or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-700 to-rose-700 text-white rounded-lg font-[poppins] font-semibold hover:from-amber-800 hover:to-rose-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Email Section */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-[philosopher]">Email Us</h3>
                    <p className="font-[poppins] opacity-90">
                      For general inquiries and appointments
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:statsaya5353@gmail.com"
                  className="inline-block mt-4 px-6 py-3 bg-white text-amber-900 rounded-lg font-[poppins] font-semibold hover:bg-amber-100 transition-colors"
                >
                  statsaya5353@gmail.com
                </a>
              </div>

              {/* Quick Contact */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
                <h3 className="text-2xl font-[philosopher] mb-6 text-amber-900">
                  Quick Contact
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Phone className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-[poppins] font-semibold text-gray-800">
                        Call Us Directly
                      </h4>
                      <p className="font-[poppins] text-gray-600">
                        Available during working hours
                      </p>
                      <div className="mt-2 space-y-1">
                        <button
                          onClick={() => handleCall("9713326656")}
                          className="font-[poppins] text-amber-700 hover:text-amber-800 transition-colors block"
                        >
                          9713326656 (Gold)
                        </button>
                        <button
                          onClick={() => handleCall("9111532020")}
                          className="font-[poppins] text-amber-700 hover:text-amber-800 transition-colors block"
                        >
                          9111532020 (Diamond)
                        </button>
                        <button
                          onClick={() => handleCall("9111332020")}
                          className="font-[poppins] text-amber-700 hover:text-amber-800 transition-colors block"
                        >
                          9111332020 (Silver)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-100 rounded-full">
                      <MessageCircle className="w-6 h-6 text-rose-700" />
                    </div>
                    <div>
                      <h4 className="font-[poppins] font-semibold text-gray-800">
                        WhatsApp Us
                      </h4>
                      <p className="font-[poppins] text-gray-600">
                        Get quick responses
                      </p>
                      <button
                        onClick={() => handleWhatsApp("9713326656")}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-[poppins] text-sm hover:bg-green-700 transition-colors"
                      >
                        Start WhatsApp Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30">
                <h3 className="text-2xl font-[philosopher] mb-6 text-amber-900">
                  Business Hours
                </h3>
                <div className="space-y-4">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div
                      key={day}
                      className="flex justify-between items-center border-b border-gray-100 pb-3"
                    >
                      <span className="font-[poppins] text-gray-700">
                        {day}
                      </span>
                      <span className="font-[poppins] font-semibold text-amber-700">
                        9:00 AM - 9:00 PM
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="font-[poppins] text-amber-800 text-sm">
                    <strong>Note:</strong> For urgent appointments after hours,
                    please call or WhatsApp us.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-[philosopher] text-center mb-12 text-amber-900">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: "How do I book an appointment?",
                  a: "You can book through our contact form, call us directly, or WhatsApp any of our branches. Online booking coming soon!",
                },
                {
                  q: "What are your payment methods?",
                  a: "We accept cash, UPI, and credit/debit cards. Advance booking requires 30% deposit.",
                },
                {
                  q: "Do you provide home services?",
                  a: "Yes, we provide premium home services for bridal makeup and special occasions (extra charges apply).",
                },
                {
                  q: "What safety measures do you follow?",
                  a: "All our branches maintain strict hygiene protocols, sanitization between clients, and use disposable tools where possible.",
                },
                {
                  q: "Can I cancel or reschedule?",
                  a: "Yes, cancellations 24 hours in advance get full refund. Rescheduling is free with prior notice.",
                },
                {
                  q: "Do you have couple packages?",
                  a: "Yes! All our branches offer special couple packages. Gold branch has dedicated couple rooms.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30"
                >
                  <h4 className="font-[philosopher] text-lg font-semibold mb-3 text-amber-800">
                    {faq.q}
                  </h4>
                  <p className="font-[poppins] text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-gradient-to-r from-amber-700 to-rose-700 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-2/3">
                <h3 className="text-2xl font-[philosopher] mb-4">
                  Find Our Locations
                </h3>
                <p className="font-[poppins] mb-6">
                  With three conveniently located branches across the city,
                  we're never too far away. Visit any of our locations for a
                  luxurious SPA and makeup experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {branches.map((branch, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                    >
                      <h4 className="font-[poppins] font-semibold mb-2">
                        {branch.name} Branch
                      </h4>
                      <p className="font-[poppins] text-sm opacity-90">
                        {branch.address.substring(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button className="px-8 py-3 bg-white text-amber-900 rounded-full font-[poppins] font-semibold hover:bg-amber-100 transition-colors shadow-lg">
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-900 to-rose-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-[philosopher] mb-4">
              Luxury SPA & Makeup Salon
            </h4>
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5" />
                <a
                  href="mailto:statsaya5353@gmail.com"
                  className="font-[poppins] hover:text-amber-200 transition-colors"
                >
                  statsaya5353@gmail.com
                </a>
              </div>
              <p className="font-[poppins]">
                Three Premium Locations • Open Daily 9 AM - 9 PM
              </p>
            </div>
            <p className="font-[poppins] text-white/80 text-sm">
              © {new Date().getFullYear()} Luxury SPA & Makeup Salon. Connect
              with us today!
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

export default ContactUs;
