import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import { CheckCircle, XCircle, Clock, Truck } from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/admin/all"); // Updated endpoint
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, isDelivered) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { isDelivered });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (order) => {
    if (!order.isPaid) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Payment
        </span>
      );
    }
    if (order.isDelivered) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Truck className="h-3 w-3 mr-1" />
        Processing
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="mt-2 text-gray-600">
          View and manage all customer orders
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-4 text-red-600 bg-red-50">{error}</Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-4 text-center text-gray-500">
              No orders found
            </Card>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {order.user?.name || "Guest"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(order)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        {order.isPaid && !order.isDelivered && (
                          <button
                            onClick={() => updateOrderStatus(order._id, true)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                Order #{selectedOrder._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Customer Information
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.user?.name || "Guest"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.user?.email || "No email provided"}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Shipping Address
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress?.address},{" "}
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.postalCode},{" "}
                  {selectedOrder.shippingAddress?.country}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start border-b border-gray-100 pb-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded object-cover mr-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>₹{selectedOrder.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Shipping</span>
                <span>₹{selectedOrder.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Tax</span>
                <span>₹{selectedOrder.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
              <div className="flex items-center">
                {getStatusBadge(selectedOrder)}
                {selectedOrder.isPaid && (
                  <span className="ml-4 text-sm text-gray-600">
                    Paid on{" "}
                    {new Date(selectedOrder.paidAt).toLocaleDateString()}
                  </span>
                )}
                {selectedOrder.isDelivered && (
                  <span className="ml-4 text-sm text-gray-600">
                    Delivered on{" "}
                    {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
