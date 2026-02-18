import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { format } from "date-fns";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusIcon = () => {
    if (order.isDelivered) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (order.isPaid) {
      return <Truck className="h-6 w-6 text-amber-500" />;
    }
    return <Clock className="h-6 w-6 text-rose-500" />;
  };

  const getStatusText = () => {
    if (order.isDelivered) {
      return "Delivered";
    } else if (order.isPaid) {
      return "Shipped";
    }
    return "Processing";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-[philosopher]">
              Error Loading Order
            </h2>
            <p className="text-gray-600 mb-6 font-[poppins]">{error}</p>
            <Link
              to="/orders"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-[philosopher]">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6 font-[poppins]">
              The order you're looking for doesn't exist.
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center text-rose-700 hover:text-rose-800 mb-4 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600 font-[poppins]">
                Placed on {format(new Date(order.createdAt), "MMMM do, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-sm">
              {getStatusIcon()}
              <span className="font-medium text-gray-700 font-[poppins]">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Shipping Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2 font-[philosopher] text-lg">
              <MapPin className="h-5 w-5 text-rose-600" />
              Shipping Address
            </h3>
            <div className="space-y-2 text-sm text-gray-600 font-[poppins]">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="mt-3 pt-3 border-t border-gray-100">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Payment Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2 font-[philosopher] text-lg">
              <CreditCard className="h-5 w-5 text-rose-600" />
              Payment Information
            </h3>
            <div className="space-y-3 text-sm font-[poppins]">
              <div>
                <p className="text-gray-600">Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod === "ONLINE"
                    ? "Online Payment"
                    : "Cash on Delivery"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p
                  className={`font-medium ${
                    order.isPaid ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending"}
                </p>
              </div>
              {order.isPaid && (
                <div>
                  <p className="text-gray-600">Paid On</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(order.paidAt), "MMMM do, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2 font-[philosopher] text-lg">
              <Package className="h-5 w-5 text-rose-600" />
              Order Summary
            </h3>
            <div className="space-y-3 text-sm font-[poppins]">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{order.itemsPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  ₹{order.shippingPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">
                  ₹{order.taxPrice.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-rose-700">
                  ₹{order.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 font-[philosopher] text-xl">
              Order Items
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "/default-product.jpg"}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 font-[poppins] text-lg mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 font-[poppins] text-sm">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-gray-500 font-[poppins] text-sm">
                      Price: ₹{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex-shrink-0 font-bold text-rose-700 font-[poppins]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
          <h3 className="font-medium text-gray-900 mb-3 font-[philosopher] text-lg">
            Need help with your order?
          </h3>
          <p className="text-gray-600 mb-4 font-[poppins]">
            Our customer service team is ready to assist you with any questions.
          </p>
          <button className="font-medium text-rose-700 hover:text-rose-800 transition-colors font-[poppins]">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
