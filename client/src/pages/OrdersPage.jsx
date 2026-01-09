import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Search,
  Filter,
} from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Orders fetch error:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (order) => {
    if (order.isDelivered) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (order.isPaid) {
      return <Truck className="h-5 w-5 text-amber-500" />;
    }
    return <Clock className="h-5 w-5 text-rose-500" />;
  };

  const getStatusText = (order) => {
    if (order.isDelivered) {
      return "Delivered";
    } else if (order.isPaid) {
      return "Shipped";
    }
    return "Processing";
  };

  const getStatusColor = (order) => {
    if (order.isDelivered) {
      return "bg-green-100 text-green-800";
    } else if (order.isPaid) {
      return "bg-amber-100 text-amber-800";
    }
    return "bg-rose-100 text-rose-800";
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderItems.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .filter((order) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "delivered") return order.isDelivered;
      if (statusFilter === "shipped") return order.isPaid && !order.isDelivered;
      if (statusFilter === "processing") return !order.isPaid;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
              Error Loading Orders
            </h2>
            <p className="text-gray-600 mb-6 font-[poppins]">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
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
            to="/dashboard"
            className="inline-flex items-center text-rose-700 hover:text-rose-800 mb-4 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 font-[poppins]">
                View your order history and track current orders
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-sm">
              <Package className="h-5 w-5 text-rose-600" />
              <span className="font-medium text-gray-700 font-[poppins]">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm text-black rounded-2xl shadow-xl p-6 border border-white/30 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-[poppins]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-[poppins]"
              >
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/30 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2 font-[philosopher]">
              {orders.length === 0
                ? "No orders yet"
                : "No orders match your search"}
            </h3>
            <p className="text-gray-500 mb-6 font-[poppins]">
              {orders.length === 0
                ? "Start shopping to see your orders here"
                : "Try adjusting your search or filter criteria"}
            </p>
            {orders.length === 0 && (
              <Link
                to="/store"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 font-[poppins]">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-gray-500 text-sm font-[poppins]">
                        Placed on{" "}
                        {format(
                          new Date(order.createdAt),
                          "MMMM do, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order
                        )} font-[poppins]`}
                      >
                        {getStatusText(order)}
                      </div>
                      <div className="hidden sm:block">
                        {getStatusIcon(order)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <p className="text-gray-500 font-[poppins]">Items</p>
                      <p className="font-medium text-gray-900 font-[poppins]">
                        {order.orderItems.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500 font-[poppins]">
                        Total Amount
                      </p>
                      <p className="font-bold text-rose-700 font-[poppins]">
                        ₹{order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500 font-[poppins]">
                        Payment Method
                      </p>
                      <p className="font-medium text-gray-900 capitalize font-[poppins]">
                        {order.paymentMethod === "ONLINE"
                          ? "Online Payment"
                          : "Cash on Delivery"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={item.image || "/default-product.jpg"}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg border-2 border-white object-cover shadow-sm"
                        />
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                          +{order.orderItems.length - 3}
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/order/${order._id}`}
                      className="text-rose-700 hover:text-rose-800 font-medium text-sm font-[poppins] transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
