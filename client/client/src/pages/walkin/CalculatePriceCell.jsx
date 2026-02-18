// CalculatePriceCell.jsx
import React, { useState } from "react";
import { Button, Tag, message } from "antd";
import { Calculator } from "lucide-react";
import api from "../../services/api";

const CalculatePriceCell = ({ walkin }) => {
  const [calculating, setCalculating] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(null);

  const handleCalculatePrice = async () => {
    try {
      setCalculating(true);

      const servicesPayload = walkin.services.map((s) => ({
        serviceId: s.service?._id,
        pricingId: s.pricing,
      }));

      const productsPayload = walkin.products.map((p) => ({
        productId: p.product?._id,
        quantity: p.quantity,
      }));

      const seatsPayload =
        walkin.seats?.map((s) => ({
          seatId: s.seat?._id,
          duration: s.duration || 1,
        })) || [];

      const payload = {
        services: servicesPayload,
        products: productsPayload,
        seats: seatsPayload,
        discount: walkin.discount || 0,
        amountPaid: walkin.amountPaid || 0,
      };

      const res = await api.post("/walkins/calculate-price", payload);

      if (res.data.success) {
        setCalculatedAmount(res.data.data.totals.totalAmount);
        message.success("Price calculated!");
      }
    } catch (error) {
      console.error("Calculate error:", error);
      message.error("Failed to calculate");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div>
      {calculatedAmount ? (
        <Tag color="green" className="font-bold">
          ₹{calculatedAmount}
        </Tag>
      ) : (
        <Button
          size="small"
          icon={<Calculator className="w-3 h-3" />}
          loading={calculating}
          onClick={handleCalculatePrice}
        >
          Calculate
        </Button>
      )}
    </div>
  );
};

export default CalculatePriceCell;
