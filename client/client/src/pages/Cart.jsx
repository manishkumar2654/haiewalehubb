import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { addToast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      addToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, qty) => {
    if (qty < 1) return;
    setUpdating(true);
    try {
      await api.patch(`/cart/${itemId}`, { quantity: qty });
      await fetchCart();
    } catch {
      addToast("Failed to update quantity", "error");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(true);
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      addToast("Item removed from cart", "success");
    } catch {
      addToast("Failed to remove item", "error");
    } finally {
      setUpdating(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) =>
        total + (item.priceAtAddition || 0) * (item.quantity || 1),
      0
    );
  };

  const totalPrice =
    cart?.totalPrice !== undefined ? cart.totalPrice : calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-white/30">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-rose-100 to-amber-100 rounded-full">
            <ShoppingBag className="h-12 w-12 text-rose-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 font-[philosopher]">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 font-[poppins]">
            Looks like you haven't added any beautiful items yet
          </p>
          <Link
            to="/store"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-xl hover:from-rose-800 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl font-[poppins] font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-[philosopher] mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 font-[poppins]">
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} in your
            cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/30">
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product?.images?.[0] || "/default-product.jpg"
                          }
                          alt={item.product?.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 font-[poppins] mb-2">
                            {item.product.name}
                          </h3>
                          <p className="text-rose-700 font-medium text-lg font-[poppins]">
                            ₹{item.priceAtAddition?.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || updating}
                              className="p-2 text-gray-600 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="mx-4 text-gray-800 font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              disabled={updating}
                              className="p-2 text-gray-600 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={updating}
                            className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[philosopher]">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-[poppins]">Subtotal</span>
                  <span className="text-gray-900 font-semibold font-[poppins]">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-[poppins]">Shipping</span>
                  <span className="text-green-600 font-[poppins]">Free</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 font-[poppins]">
                      Total
                    </span>
                    <span className="text-lg font-bold text-rose-700 font-[poppins]">
                      ₹{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/createorder")}
                disabled={updating}
                className="w-full bg-gradient-to-r from-rose-700 to-amber-700 text-white py-4 rounded-xl font-semibold hover:from-rose-800 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-[poppins]"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/store"
                className="w-full mt-4 inline-flex items-center justify-center text-rose-700 hover:text-rose-800 font-medium transition-colors font-[poppins]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
            <div className="w-12 h-12 mx-auto mb-3 bg-rose-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-rose-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 font-[poppins]">
              Free Shipping
            </h3>
            <p className="text-sm text-gray-600 font-[poppins]">
              On orders over ₹999
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 font-[poppins]">
              Easy Returns
            </h3>
            <p className="text-sm text-gray-600 font-[poppins]">
              30-day return policy
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 font-[poppins]">
              Secure Payment
            </h3>
            <p className="text-sm text-gray-600 font-[poppins]">
              100% secure transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
