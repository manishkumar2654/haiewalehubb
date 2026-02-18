import React, { useState, useEffect } from "react";
import ServicesSection from "../components/home/ServicesSection";
import BeautyMeetsNature from "../components/home/BeautyMeetsNature";
import CallToAction from "../components/home/CallToAction";
import ProductsSection from "../components/home/ProductsSection";
import BranchLocations from "../components/home/BranchLocations";

const Home = () => {
  const [logoImage, setLogoImage] = useState("/image.png"); // Default logo path

  // Function to handle logo upload (for admin)
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImage(reader.result);
        // Save to localStorage or backend
        localStorage.setItem("customLogo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check for saved logo on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem("customLogo");
    if (savedLogo) {
      setLogoImage(savedLogo);
    }
  }, []);

  return (
    <main className="bg-white">
      {/* Hidden file input for logo upload (admin only) */}
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
        id="logoUpload"
      />

      {/* Hero Section */}
      <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-white">
        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {/* Logo with Upload Option */}
          <div className="mb-8 relative group">
            <div className="w-48 h-46 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg shadow-amber-900/30">
              <img
                src={logoImage}
                alt="Hair Hub Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png"; // Fallback logo
                }}
              />
            </div>

            {/* Upload Icon (Hover to show) */}
            <label
              htmlFor="logoUpload"
              className="absolute -bottom-2 -right-2 bg-amber-600 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg hover:bg-amber-700"
              title="Change Logo"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          </div>

          {/* Main Heading with Black & Gold */}
          <h1 className="text-center mb-6">
            <span className="block text-6xl md:text-8xl lg:text-9xl font-[philosopher] font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 animate-gradient-flow">
                Hair Hub
              </span>
            </span>
            <span className="block text-xl md:text-2xl lg:text-3xl font-[poppins] mt-4 tracking-wider text-gray-800">
              Excellence in Every Strand
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center font-[poppins] mb-10 leading-relaxed">
            Where luxury meets perfection. Experience world-class hair care with
            our premium services and expert stylists.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">15+</div>
              <div className="text-gray-700 text-sm uppercase tracking-wider">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">50+</div>
              <div className="text-gray-700 text-sm uppercase tracking-wider">
                Expert Stylists
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">10K+</div>
              <div className="text-gray-700 text-sm uppercase tracking-wider">
                Happy Clients
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600">5</div>
              <div className="text-gray-700 text-sm uppercase tracking-wider">
                Premium Locations
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-amber-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-amber-400 rounded-full mt-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections */}
      <ServicesSection />

      {/* <BeautyMeetsNature /> */}

      <ProductsSection />

      <BranchLocations />

      <CallToAction />

      {/* Add this to your global CSS or CSS-in-JS */}
      <style jsx global>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradientFlow 3s ease infinite;
        }
      `}</style>
    </main>
  );
};

export default Home;
