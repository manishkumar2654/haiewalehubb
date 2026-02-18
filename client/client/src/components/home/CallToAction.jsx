import React from "react";
import { Link } from "react-router-dom";
const CallToAction = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-rose-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-philosopher text-rose-950 mb-6">
          Ready to Experience True Relaxation?
        </h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
          Book your appointment today and let our experts take care of you with
          our premium services.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* <Link to="/appointment">
            <button className="bg-rose-950 hover:bg-rose-900 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-lg">
              Book Now
            </button>
          </Link> */}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
