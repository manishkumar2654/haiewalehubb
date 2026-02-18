// src/pages/AddressManagement.js
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AddressList from "../components/AddressList";

const AddressManagement = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-rose-700 hover:text-rose-800 mb-4 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
            Address Management
          </h1>
          <p className="text-gray-600 font-[poppins]">
            Manage your shipping addresses for faster checkout
          </p>
        </div>

        {/* Address List */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
          <AddressList
            isCheckout={false}
            selectedAddress={null}
            setSelectedAddress={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressManagement;
