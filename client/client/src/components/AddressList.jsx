// src/components/AddressList.js
import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import AddressForm from "./AddressForm";
import { Edit, Trash2, Plus, MapPin } from "lucide-react";

const AddressList = ({
  selectedAddress,
  setSelectedAddress,
  isCheckout = false,
}) => {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data);

      // If no address is selected yet, select the first one
      if (!selectedAddress && res.data.length > 0) {
        setSelectedAddress(res.data[0]);
      }
    } catch (err) {
      addToast("Failed to load addresses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      await api.delete(`/addresses/${addressId}`);
      addToast("Address deleted successfully", "success");

      // If the deleted address was selected, select a different one
      if (selectedAddress && selectedAddress._id === addressId) {
        const newAddresses = addresses.filter((addr) => addr._id !== addressId);
        if (newAddresses.length > 0) {
          setSelectedAddress(newAddresses[0]);
        } else {
          setSelectedAddress(null);
        }
      }

      fetchAddresses(); // Refresh the list
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to delete address",
        "error"
      );
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses(); // Refresh the list
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isCheckout && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-[philosopher]">
            My Addresses
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-[poppins]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Address
          </button>
        </div>
      )}

      {showForm && (
        <AddressForm
          onSave={handleSave}
          onCancel={handleCancel}
          mode={editingAddress ? "edit" : "add"}
          address={editingAddress}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-[poppins]">
            No addresses saved yet
          </h3>
          <p className="text-gray-600 mb-4 font-[poppins]">
            Add your first address to make checkout faster
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-[poppins]"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-lg shadow-md p-4 border-2 ${
                selectedAddress && selectedAddress._id === address._id
                  ? "border-rose-500"
                  : "border-white"
              } hover:border-rose-300 transition-colors cursor-pointer`}
              onClick={() => setSelectedAddress(address)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 bg-rose-100 text-rose-800 text-xs font-medium rounded-full font-[poppins]">
                  {address.label}
                </span>
                {!isCheckout && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(address);
                        setShowForm(true);
                      }}
                      className="text-gray-500 hover:text-rose-600 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(address._id);
                      }}
                      className="text-gray-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-gray-900 mb-2 font-[poppins]">
                {address.fullName}
              </h3>
              <p className="text-sm text-gray-600 mb-1 font-[poppins]">
                {address.street}
              </p>
              <p className="text-sm text-gray-600 mb-1 font-[poppins]">
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-sm text-gray-600 mb-2 font-[poppins]">
                {address.country}
              </p>
              <p className="text-sm text-gray-600 font-[poppins]">
                Phone: {address.phone}
              </p>

              {selectedAddress && selectedAddress._id === address._id && (
                <div className="mt-3 text-xs text-rose-600 font-medium font-[poppins]">
                  Selected
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
