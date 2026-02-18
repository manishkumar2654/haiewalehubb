import React, { useState, useEffect } from "react";
import { Scissors, Check, CreditCard, Calendar, User } from "lucide-react";
import { Modal, Tag, Button, message, Select } from "antd";

const { Option } = Select;

const ServiceModal = ({
  visible,
  service,
  onCancel,
  onSelect,
  categories,
  availableStaff,
}) => {
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [filteredStaff, setFilteredStaff] = useState([]);

  // Reset when service changes
  useEffect(() => {
    setSelectedPricing(null);
    setSelectedStaffId(null);

    if (service && categories && availableStaff) {
      // Find category for this service
      const categoryId = service.category?._id || service.category;
      const category = categories.find((c) => c._id === categoryId);

      // Filter staff based on category role
      if (category?.assignedEmployeeRole) {
        const requiredRole = category.assignedEmployeeRole.toLowerCase();
        const filtered = availableStaff.filter((staff) => {
          const staffRole = staff.employeeRole?.toLowerCase() || "";
          return staffRole === requiredRole;
        });
        setFilteredStaff(filtered);
      } else {
        setFilteredStaff(availableStaff);
      }
    }
  }, [service, categories, availableStaff]);

  const handleSelect = () => {
    if (selectedPricing && service) {
      // ✅ Staff ID bhi pass karo onSelect me
      onSelect(service._id, selectedPricing._id, selectedStaffId);
      message.success("Service added successfully!");
    } else {
      message.warning("Please select a pricing option first");
    }
  };

  if (!service) return null;

  console.log("ServiceModal rendering, visible:", visible);
  console.log("Service data:", service);
  console.log("Filtered staff count:", filteredStaff.length);
  console.log("Selected staff:", selectedStaffId);

  return (
    <Modal
      title={
        <div className="flex items-center">
          <Scissors className="w-5 h-5 mr-2 text-blue-600" />
          <span>{service.name}</span>
        </div>
      }
      open={visible}
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
          {selectedStaffId ? "Add with Staff" : "Add Service"}
        </Button>,
      ]}
      width={700} // Width increase kiya
      centered
    >
      <div className="space-y-6">
        {service.description && (
          <p className="text-gray-600">{service.description}</p>
        )}

        {/* Category Info */}
        <div>
          <h4 className="font-[poppins] font-semibold mb-2">
            Service Category
          </h4>
          <Tag color="blue" className="text-lg py-1 px-3">
            {service.category?.name || "Uncategorized"}
          </Tag>
        </div>

        {/* Pricing Section - MOST IMPORTANT */}
        {service.pricing && service.pricing.length > 0 ? (
          <div>
            <h4 className="font-[poppins] font-semibold mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
              Select Pricing Option:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.pricing.map((price) => (
                <div
                  key={price._id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPricing?._id === price._id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedPricing(price)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">
                        {price.label || price.duration || "Standard"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {price.durationMinutes || 0} minutes
                      </div>
                      {price.description && (
                        <div className="text-xs text-gray-500 mt-2">
                          {price.description}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{price.price || 0}
                    </div>
                  </div>
                  {selectedPricing?._id === price._id && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-sm text-blue-600 font-medium">
                        ✓ Selected
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center font-medium">
              No pricing options available for this service
            </p>
          </div>
        )}

        {/* Staff Selection Section - NEW */}
        {selectedPricing && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-[poppins] font-semibold mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-purple-600" />
              Assign Staff (Optional):
            </h4>

            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">
                {filteredStaff.length > 0
                  ? `Available ${
                      service.category?.assignedEmployeeRole || "staff"
                    } (${filteredStaff.length})`
                  : `No ${
                      service.category?.assignedEmployeeRole || "matching"
                    } staff available`}
              </div>

              <Select
                placeholder="Select staff (optional)"
                style={{ width: "100%" }}
                value={selectedStaffId}
                onChange={setSelectedStaffId}
                allowClear
                size="large"
                disabled={filteredStaff.length === 0}
              >
                <Option value="">Not assigned (any available)</Option>
                {filteredStaff.map((staff) => (
                  <Option key={staff._id} value={staff._id}>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-bold">
                          {staff.name?.charAt(0) || "S"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{staff.name}</div>
                        <div className="text-xs text-gray-500">
                          {staff.employeeRole || "Staff"} •{" "}
                          {staff.workingLocation || "Branch"}
                        </div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>

              {selectedStaffId && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium">
                      Staff assigned -{" "}
                      {
                        filteredStaff.find((s) => s._id === selectedStaffId)
                          ?.name
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Staff can be changed later in the service table
            </p>
          </div>
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
          <div className="text-center py-3 text-amber-600 font-medium bg-amber-50 rounded-lg border border-amber-200">
            ⚠️ Please select a pricing option above to continue
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ServiceModal;
