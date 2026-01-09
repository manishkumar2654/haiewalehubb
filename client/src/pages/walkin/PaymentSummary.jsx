import React from "react";
import { Select, Input, Tag } from "antd";

const { Option } = Select;

const PaymentSummary = ({ formData, setFormData, calculateTotals }) => {
  const totals = calculateTotals();

  return (
    <div className="space-y-6 text-black ">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-[poppins] font-semibold mb-4">Summary</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Services Total:</span>
            <span className="font-semibold">₹{totals.servicesTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Products Total:</span>
            <span className="font-semibold">₹{totals.productsTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold">₹{totals.subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount:</span>
            <span className="font-semibold text-red-600">
              -₹{totals.discountAmount}
            </span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Amount:</span>
              <span className="text-green-600">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            Discount Amount
          </label>
          <Input
            type="number"
            value={formData.discount}
            onChange={(e) =>
              setFormData({
                ...formData,
                discount: parseFloat(e.target.value) || 0,
              })
            }
            min={0}
            max={totals.subtotal}
            prefix="₹"
          />
        </div>

        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
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
            <Option value="card">Credit/Debit Card</Option>
            <Option value="upi">UPI</Option>
            <Option value="credit">Credit</Option>
          </Select>
        </div>

        <div>
          <label className="block font-[poppins] text-gray-700 mb-2">
            Amount Paid
          </label>
          <Input
            type="number"
            value={formData.amountPaid}
            onChange={(e) =>
              setFormData({
                ...formData,
                amountPaid: parseFloat(e.target.value) || 0,
              })
            }
            min={0}
            max={totals.total}
            prefix="₹"
          />
        </div>

        <div className="flex items-end">
          <div className="bg-amber-50 p-4 rounded-lg w-full">
            <div className="flex justify-between mb-2">
              <span>Due Amount:</span>
              <span className="font-bold text-red-600">
                ₹{totals.dueAmount.toFixed(2)}
              </span>
            </div>
            <Tag
              color={totals.dueAmount === 0 ? "green" : "orange"}
              className="w-full text-center"
            >
              {totals.dueAmount === 0 ? "Fully Paid" : "Partially Paid"}
            </Tag>
          </div>
        </div>
      </div>

      {/* Final Summary */}
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-lg font-[poppins] font-semibold mb-4 text-amber-800">
          Final Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-700">Customer:</p>
              <p className="text-sm text-gray-600">
                {formData.customerName || "Not specified"}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Branch:</p>
              <p className="text-sm text-gray-600">{formData.branch}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="font-medium text-gray-700">Services:</p>
              <p className="text-sm text-gray-600">
                {formData.selectedServices.length} service(s)
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Products:</p>
              <p className="text-sm text-gray-600">
                {formData.selectedProducts.length} product(s)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
