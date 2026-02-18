import React, { useState } from "react";
import {
  Calculator,
  CreditCard,
  DollarSign,
  Percent,
  Wallet,
  CheckCircle,
} from "lucide-react";
import {
  Input,
  Select,
  Card,
  Tag,
  Button,
  Statistic,
  Alert,
  Divider,
  message,
} from "antd";
import api from "../../services/api";

const { Option } = Select;

const PaymentSummary = ({ formData, setFormData, calculateTotals }) => {
  const [calculating, setCalculating] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const handleCalculatePrice = async () => {
    try {
      setCalculating(true);

      const servicesPayload = formData.selectedServices.map((s) => ({
        serviceId: s.serviceId,
        pricingId: s.pricingId,
      }));

      const productsPayload = formData.selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity || 1,
      }));

      const seatsPayload = formData.selectedSeats.map((s) => ({
        seatId: s.seatId,
        duration: s.duration || 1,
      }));

      const payload = {
        services: servicesPayload,
        products: productsPayload,
        seats: seatsPayload,
        discount: formData.discount || 0,
        amountPaid: formData.amountPaid || 0,
      };

      console.log("Calculating price with payload:", payload);

      const res = await api.post("/walkins/calculate-price", payload);

      if (res.data.success) {
        setCalculatedPrice(res.data.data);
        message.success("Price calculated successfully!");

        // Automatically update formData with calculated totals
        setFormData((prev) => ({
          ...prev,
          discount: res.data.data.totals.discount || 0,
          amountPaid: res.data.data.totals.amountPaid || 0,
        }));
      } else {
        message.error("Failed to calculate price");
      }
    } catch (error) {
      console.error("Calculate price error:", error);
      message.error(
        error.response?.data?.message || "Failed to calculate price"
      );
    } finally {
      setCalculating(false);
    }
  };

  const applyCalculatedPrice = () => {
    if (!calculatedPrice) return;

    setFormData((prev) => ({
      ...prev,
      discount: calculatedPrice.totals.discount,
      amountPaid: calculatedPrice.totals.amountPaid,
    }));

    message.success("Price applied to form!");
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Calculate Price Button */}
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<Calculator className="w-4 h-4" />}
          loading={calculating}
          onClick={handleCalculatePrice}
          size="large"
        >
          Calculate Total Price
        </Button>
      </div>

      {calculatedPrice && (
        <Alert
          message={
            <div className="flex items-center justify-between">
              <span className="font-semibold">Calculated Price</span>
              <Button type="link" size="small" onClick={applyCalculatedPrice}>
                Apply to Form
              </Button>
            </div>
          }
          description={
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold ml-2">
                    ₹{calculatedPrice.totals.subtotal}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold ml-2 text-red-600">
                    -₹{calculatedPrice.totals.discount}
                  </span>
                </div>
                <div className="text-sm col-span-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold ml-2 text-green-600">
                    ₹{calculatedPrice.totals.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          }
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Order Summary" size="small">
          {/* Services */}
          {formData.selectedServices.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Services ({formData.selectedServices.length})
              </h4>
              {formData.selectedServices.map((service, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2 pb-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-xs text-gray-600">
                      {service.duration} mins
                    </div>
                  </div>
                  <div className="font-semibold">₹{service.price}</div>
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {formData.selectedProducts.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Products ({formData.selectedProducts.length})
              </h4>
              {formData.selectedProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2 pb-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-xs text-gray-600">
                      Qty: {product.quantity}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">₹{product.total}</div>
                    <div className="text-xs text-gray-600 text-right">
                      ₹{product.price} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seats */}
          {formData.selectedSeats.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Seats ({formData.selectedSeats.length})
              </h4>
              {formData.selectedSeats.map((seat, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2 pb-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">Seat {seat.seatNumber}</div>
                    <div className="text-xs text-gray-600">
                      {seat.seatType} • {seat.duration}h
                    </div>
                  </div>
                  <div className="font-semibold">₹{seat.total}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Payment Details" size="small">
          {/* Discount Input */}
          <div className="mb-4">
            <label className="block font-[poppins] text-gray-700 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Discount (₹)
            </label>
            <Input
              type="number"
              min="0"
              value={formData.discount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter discount amount"
              prefix="₹"
              size="large"
            />
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block font-[poppins] text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment Method
            </label>
            <Select
              value={formData.paymentMethod}
              onChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
              }
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="upi">UPI</Option>
              <Option value="credit">Credit</Option>
            </Select>
          </div>

          {/* Amount Paid */}
          <div className="mb-6">
            <label className="block font-[poppins] text-gray-700 mb-2">
              <Wallet className="w-4 h-4 inline mr-2" />
              Amount Paid (₹)
            </label>
            <Input
              type="number"
              min="0"
              max={totals.total}
              value={formData.amountPaid}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amountPaid: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter amount paid"
              prefix="₹"
              size="large"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max: ₹{totals.total.toFixed(2)}
            </p>
          </div>

          <Divider />

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">
                ₹{totals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="font-semibold text-red-600">
                -₹{totals.discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-green-600">
                  ₹{totals.total.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">
                ₹{formData.amountPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Due Amount:</span>
              <span
                className={`font-bold ${
                  totals.dueAmount > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                ₹{totals.dueAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Status Tag */}
          <div className="mt-4 text-center">
            <Tag
              color={
                totals.dueAmount === 0
                  ? "success"
                  : formData.amountPaid > 0
                  ? "processing"
                  : "error"
              }
              className="text-sm font-semibold py-1 px-3"
            >
              {totals.dueAmount === 0
                ? "FULLY PAID"
                : formData.amountPaid > 0
                ? "PARTIALLY PAID"
                : "PENDING PAYMENT"}
            </Tag>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSummary;
