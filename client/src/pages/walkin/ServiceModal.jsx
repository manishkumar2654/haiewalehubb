import React, { useState } from "react";
import { Scissors, Check, CreditCard, Calendar } from "lucide-react";
import { Modal, Tag, Button, message } from "antd";

const ServiceModal = ({ visible, service, onCancel, onSelect }) => {
  const [selectedPricing, setSelectedPricing] = useState(null);

  const handleSelect = () => {
    if (selectedPricing && service) {
      onSelect(service._id, selectedPricing._id);
      message.success("Service added successfully!");
    } else {
      message.warning("Please select a pricing option first");
    }
  };

  if (!service) return null;

  console.log("ServiceModal rendering, visible:", visible); // Debug
  console.log("Service data:", service); // Debug

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Scissors className="w-5 h-5 mr-2 text-blue-600" />
          <span>{service.name}</span>
        </div>
      }
      open={visible} // ✅ IMPORTANT: Change from `visible` to `open` for Ant Design v5
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="select"
          type="primary"
          disabled={!selectedPricing}
          onClick={handleSelect}
        >
          Select Service
        </Button>,
      ]}
      width={600}
      centered
    >
      <div className="space-y-4">
        {service.description && (
          <p className="text-gray-600">{service.description}</p>
        )}

        {service.benefits && service.benefits.length > 0 && (
          <div>
            <h4 className="font-[poppins] font-semibold mb-2 flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Benefits:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {service.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-600">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing Section - MOST IMPORTANT */}
        {service.pricing && service.pricing.length > 0 ? (
          <div>
            <h4 className="font-[poppins] font-semibold mb-2 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
              Pricing Options:
            </h4>
            <div className="space-y-2">
              {service.pricing.map((price) => (
                <div
                  key={price._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedPricing?._id === price._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedPricing(price)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {price.label || price.duration || "Standard"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {price.durationMinutes || 0} minutes
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ₹{price.price || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">
              No pricing options available for this service
            </p>
          </div>
        )}

        {service.weekdays && service.weekdays.length > 0 && (
          <div>
            <h4 className="font-[poppins] font-semibold mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              Available Days:
            </h4>
            <div className="flex flex-wrap gap-2">
              {service.weekdays.map((day) => (
                <Tag key={day} color="purple">
                  {day}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {service.pricing && service.pricing.length > 0 && !selectedPricing && (
          <div className="text-center py-2 text-amber-600 text-sm">
            Please select a pricing option above
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ServiceModal;
