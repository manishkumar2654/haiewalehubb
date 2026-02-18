import React, { useState } from "react";

const CustomerDetails = ({
  customerDetails,
  setCustomerDetails,
  onSubmit,
  onBack,
}) => {
  // Empty state se start karo, logged-in user ka data nahi
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.name || !details.phone) {
      alert("Please enter customer name and phone number");
      return;
    }
    // Yahan par setCustomerDetails call karo with entered details
    console.log("Setting customer details:", details);
    setCustomerDetails(details);
    onSubmit(details);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Customer Details</h2>
      <p className="text-sm text-gray-600 text-center mb-4">
        Please enter the customer's information
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={details.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            required
            placeholder="Enter customer phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            name="email"
            value={details.email}
            onChange={handleChange}
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="Enter customer email (optional)"
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
          >
            Continue to Summary
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetails;
