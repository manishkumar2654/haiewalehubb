import React from "react";
import { Link } from "react-router-dom";

const BeautyMeetsNature = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-rose-200/30 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-amber-200/30 blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-rose-300/20 blur-xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 py-24 sm:py-32">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main heading with decorative elements */}
          <div className="relative">
            <h1 className="font-[philosopher] uppercase font-normal leading-none tracking-tight">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl 2xl:text-9xl text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-800 via-stone-400 to-rose-800 animate-gradient-flow">
                WHERE BEAUTY
              </span>

              <span className="flex justify-center items-center mt-2 sm:mt-4 md:mt-6">
                <span className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent via-rose-800/50 to-transparent flex-1"></span>
                <img
                  src="/scndimg2.png"
                  alt="decor"
                  className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 mx-2 sm:mx-4 transform hover:rotate-12 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="hidden sm:block w-16 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent flex-1"></span>
              </span>

              <span className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-2 sm:mt-4 md:mt-6">
                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl 2xl:text-9xl text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-800 via-stone-400 to-rose-800 animate-gradient-flow">
                  MEETS
                </span>
                <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl 2xl:text-9xl text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-stone-400 via-rose-800 to-stone-400 animate-gradient-flow">
                  NATURE
                </span>
              </span>
            </h1>

            {/* Floating leaves decoration */}
            <div className="absolute -top-8 -left-8 sm:-top-12 sm:-left-12 opacity-20">
              <svg
                className="w-16 h-16 sm:w-24 sm:h-24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>

          {/* Subheading and description */}
          <div className="mt-12 md:mt-16 lg:mt-20 max-w-2xl mx-auto px-4 sm:px-6">
            <span className="inline-block font-[philosopher] text-xl sm:text-2xl font-medium uppercase tracking-wider mb-2 sm:mb-4 relative">
              <span className="text-transparent bg-clip-text bg-[length:300%_300%] bg-gradient-to-r from-rose-800 via-stone-400 to-rose-800 animate-gradient-flow">
                at s.tatsaya
              </span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-rose-400/30 to-amber-400/30"></span>
            </span>

            <p className="text-gray-700 font-[poppins] mt-6 text-sm sm:text-base md:text-lg leading-relaxed sm:leading-loose">
              We're more than just a spa — we're your sanctuary of serenity.
              With a commitment to holistic wellness, expert care, and a warm,
              welcoming environment, we help you unwind, heal, and feel your
              best. Our goal is simple: to make relaxation and rejuvenation a
              regular part of your lifestyle.
            </p>

            {/* CTA Button */}
            <div className="mt-8 sm:mt-12">
              <Link to="/appointment">
                {" "}
                <button className="px-8 sm:px-10 py-3 sm:py-4 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[length:300%_300%] bg-gradient-to-r from-rose-800 via-stone-400 to-rose-800 animate-gradient-flow">
                  Discover Our Treatments
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white/80 to-transparent"></div>

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
          animation: gradientFlow 6s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default BeautyMeetsNature;
