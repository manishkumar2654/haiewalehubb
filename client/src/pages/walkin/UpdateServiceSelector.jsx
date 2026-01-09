// UpdateServiceSelector.jsx - SPECIFICALLY FOR UPDATE MODAL
import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Input, Select, Card, Tag, Button } from "antd";

const { Option } = Select;

const UpdateServiceSelector = ({
  services,
  categories,
  availableStaff,
  onServiceSelect, // DIRECT CALLBACK FUNCTION
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = searchTerm
      ? service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = filteredCategory
      ? service.category?._id === filteredCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  // Handle service click
  const handleServiceClick = (service) => {
    console.log("📦 Service clicked:", service.name);
    setSelectedService(service);
    setSelectedPricing(null);
    setSelectedStaffId(null);
  };

  // Handle pricing select
  const handlePricingSelect = (pricing) => {
    console.log("💰 Pricing selected:", pricing);
    setSelectedPricing(pricing);
  };

  // Handle staff select
  const handleStaffSelect = (staffId) => {
    console.log("👤 Staff selected:", staffId);
    setSelectedStaffId(staffId);
  };

  // Handle add service
  const handleAddService = () => {
    if (!selectedService || !selectedPricing) {
      console.error("❌ Service or pricing not selected");
      return;
    }

    const serviceData = {
      serviceId: selectedService._id,
      pricingId: selectedPricing._id,
      staffId: selectedStaffId,
      name: selectedService.name,
      duration: selectedPricing.durationMinutes || 30,
      price: selectedPricing.price || 0,
      categoryName: selectedService.category?.name || "Uncategorized",
    };

    console.log("✅ Adding service:", serviceData);

    // Call parent callback
    if (onServiceSelect) {
      onServiceSelect(serviceData);
    }

    // Reset selection
    setSelectedService(null);
    setSelectedPricing(null);
    setSelectedStaffId(null);
  };

  // Get filtered staff based on service category
  const getFilteredStaff = () => {
    if (!selectedService || !availableStaff.length) return [];

    const categoryId = selectedService.category?._id;
    if (!categoryId) return availableStaff;

    const category = categories.find((c) => c._id === categoryId);
    const requiredRole = category?.assignedEmployeeRole?.toLowerCase() || "";

    if (!requiredRole) return availableStaff;

    return availableStaff.filter((staff) => {
      const staffRole = staff.employeeRole?.toLowerCase() || "";
      return staffRole === requiredRole;
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search services..."
          prefix={<Search className="w-4 h-4" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filter by category"
          style={{ width: 200 }}
          value={filteredCategory}
          onChange={(value) => setFilteredCategory(value)}
          allowClear
        >
          <Option value="">All Categories</Option>
          {categories.map((cat) => (
            <Option key={cat._id} value={cat._id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No services found
          </h3>
          <p className="text-gray-500">
            {searchTerm || filteredCategory
              ? "Try different search terms or filters"
              : "No services available"}
          </p>
        </div>
      ) : (
        <>
          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card
                key={service._id}
                hoverable
                className={`border transition-all cursor-pointer ${
                  selectedService?._id === service._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:shadow-md"
                }`}
                onClick={() => handleServiceClick(service)}
                bodyStyle={{ padding: "16px" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-[poppins] font-semibold text-gray-800 mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.category?.name || "Uncategorized"}
                    </p>

                    {service.pricing && service.pricing.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {service.pricing.slice(0, 2).map((price) => (
                          <Tag
                            key={price._id}
                            color={
                              selectedPricing?._id === price._id
                                ? "blue"
                                : "default"
                            }
                            className="mr-1 mb-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePricingSelect(price);
                            }}
                          >
                            {price.label || price.duration}: ₹{price.price}
                          </Tag>
                        ))}
                        {service.pricing.length > 2 && (
                          <Tag color="cyan" className="text-xs">
                            +{service.pricing.length - 2} more options
                          </Tag>
                        )}
                      </div>
                    ) : (
                      <Tag color="orange" className="mt-2">
                        No pricing available
                      </Tag>
                    )}

                    {service.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-2">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Selected Service Details */}
          {selectedService && (
            <Card size="small" title="Service Details" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-lg">
                      {selectedService.name}
                    </h4>
                    <p className="text-gray-600">
                      {selectedService.category?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{selectedPricing?.price || 0}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedPricing?.durationMinutes || 0} mins
                    </div>
                  </div>
                </div>

                {/* Pricing Selection */}
                {selectedService.pricing &&
                  selectedService.pricing.length > 1 && (
                    <div>
                      <p className="font-medium mb-2">Select Pricing Option:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.pricing.map((price) => (
                          <Button
                            key={price._id}
                            type={
                              selectedPricing?._id === price._id
                                ? "primary"
                                : "default"
                            }
                            size="small"
                            onClick={() => handlePricingSelect(price)}
                          >
                            {price.label || price.duration}: ₹{price.price}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Staff Selection */}
                {availableStaff.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Assign Staff:</p>
                    <Select
                      placeholder="Select staff"
                      style={{ width: "100%" }}
                      value={selectedStaffId}
                      onChange={handleStaffSelect}
                      allowClear
                    >
                      {getFilteredStaff().map((staff) => (
                        <Option key={staff._id} value={staff._id}>
                          {staff.name} ({staff.employeeRole || "Staff"})
                        </Option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Add Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="primary"
                    block
                    onClick={handleAddService}
                    disabled={!selectedPricing}
                    icon={<Plus />}
                  >
                    Add Service to Walk-in
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateServiceSelector;
