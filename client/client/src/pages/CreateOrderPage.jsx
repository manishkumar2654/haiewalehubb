import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import AddressList from "../components/AddressList";
import { ArrowLeft, CreditCard, Wallet, Loader } from "lucide-react";

// Load Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const CreateOrderPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script when component mounts
    const loadScript = async () => {
      const res = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      setRazorpayLoaded(res);

      if (!res) {
        addToast("Failed to load payment service", "error");
      }
    };

    loadScript();

    // Fetch cart and address data
    (async () => {
      try {
        const res = await api.get("/cart");
        setCart(res.data);

        const adrRes = await api.get("/addresses");
        if (adrRes.data.length > 0) {
          setSelectedAddress(adrRes.data[0]);
        }
      } catch {
        addToast("Failed to load cart/address data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRazorpayPayment = async (orderData, razorpayOrder) => {
    if (!razorpayLoaded) {
      addToast("Payment service not available", "error");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Your Company Name",
      description: `Order #${orderData._id}`,
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          // Verify payment with backend
          const verifyRes = await api.post("/orders/verify-payment", {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (verifyRes.data.order) {
            addToast("Payment successful! Order confirmed.", "success");
            navigate(`/order/${orderData._id}`);
          }
        } catch (err) {
          addToast(
            err.response?.data?.message || "Payment verification failed",
            "error"
          );
        }
      },
      prefill: {
        name: orderData.user?.name || "",
        email: orderData.user?.email || "",
        contact: orderData.shippingAddress?.phone || "",
      },
      notes: {
        order_id: orderData._id,
      },
      theme: {
        color: "#EC4899",
      },
      modal: {
        ondismiss: function () {
          addToast("Payment cancelled", "info");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart?.items?.length) {
      addToast("Your cart is empty", "error");
      return;
    }
    if (!selectedAddress) {
      addToast("Please select or add an address", "error");
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await api.post("/orders", {
        paymentMethod,
        shippingAddress: selectedAddress,
        taxPrice: 0,
        shippingPrice: 0,
      });

      const orderData = res.data.order || res.data;

      if (paymentMethod === "ONLINE" && res.data.razorpayOrder) {
        // Handle online payment with Razorpay
        await handleRazorpayPayment(orderData, res.data.razorpayOrder);
      } else {
        // Handle COD payment
        addToast("Order created successfully", "success");
        navigate(`/order/${orderData._id}`);
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create order",
        "error"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-rose-700 hover:text-rose-800 mb-4 font-[poppins] font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 font-[poppins]">
            Complete your purchase with confidence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-[philosopher]">
                Order Summary
              </h2>

              {cart?.items?.length > 0 ? (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                    >
                      <img
                        src={
                          item.product?.images?.[0] || "/default-product.jpg"
                        }
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 font-[poppins]">
                          {item.product?.name || "Appointment Booking"}
                        </h3>
                        {item.appointment && (
                          <p className="text-xs text-gray-500 font-[poppins]">
                            Appointment ID: {item.appointment}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 font-[poppins]">
                          Qty: {item.quantity} × ₹
                          {item.priceAtAddition?.toFixed(2)}
                        </p>
                      </div>
                      <div className="font-semibold text-rose-700 font-[poppins]">
                        ₹{(item.priceAtAddition * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 font-[poppins]">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-rose-700 font-[poppins]">
                        ₹{cart.totalPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4 font-[poppins]">
                    No items in your cart
                  </p>
                  <Link
                    to="/store"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-[poppins]"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* Address Management */}
            <div className="bg-white/95 backdrop-blur-sm text-black rounded-2xl shadow-xl p-6 border border-white/30">
              <h2 className="text-xl font-bold text-black mb-4 font-[philosopher]">
                Shipping Address
              </h2>
              <AddressList
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
              />
            </div>
          </div>

          {/* Right Column - Payment & Checkout */}
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-[philosopher]">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 transition-colors has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Wallet className="w-5 h-5 text-rose-600 mr-2" />
                    <span className="font-medium text-gray-900 font-[poppins]">
                      Cash on Delivery
                    </span>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 transition-colors has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                  <input
                    type="radio"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div className="ml-3 flex items-center">
                    <CreditCard className="w-5 h-5 text-rose-600 mr-2" />
                    <span className="font-medium text-gray-900 font-[poppins]">
                      Pay Online
                    </span>
                  </div>
                </label>

                {paymentMethod === "ONLINE" && !razorpayLoaded && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mt-2">
                    Loading payment gateway...
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-[philosopher]">
                Order Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[poppins]">Subtotal</span>
                  <span className="text-gray-900 font-[poppins]">
                    ₹{cart?.totalPrice?.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[poppins]">Shipping</span>
                  <span className="text-green-600 font-[poppins]">Free</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[poppins]">Tax</span>
                  <span className="text-gray-900 font-[poppins]">₹0.00</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 font-[poppins]">
                      Total
                    </span>
                    <span className="text-lg font-bold text-rose-700 font-[poppins]">
                      ₹{cart?.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  !cart?.items?.length ||
                  !selectedAddress ||
                  (paymentMethod === "ONLINE" && !razorpayLoaded)
                }
                className="w-full mt-6 bg-gradient-to-r from-rose-700 to-amber-700 text-white py-4 rounded-xl font-semibold hover:from-rose-800 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-[poppins] flex items-center justify-center"
              >
                {placingOrder ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    {paymentMethod === "ONLINE"
                      ? "Processing..."
                      : "Placing Order..."}
                  </>
                ) : paymentMethod === "ONLINE" ? (
                  "Pay Now"
                ) : (
                  "Place Order"
                )}
              </button>
            </div>

            {/* Security Badge */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 font-[poppins] font-medium">
                  Secure & Encrypted Payment
                </span>
              </div>
              <p className="text-xs text-gray-500 font-[poppins]">
                Your payment information is protected with 256-bit SSL
                encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
