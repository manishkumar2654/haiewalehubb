import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Input, Select, Card, Tag, Button, message, Alert } from "antd";

const { Option } = Select;

const UpdateServiceSelector = ({
  services,
  categories,
  availableStaff,
  onServiceSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // ✅ Button enable/disable check
  useEffect(() => {
    const enabled = Boolean(selectedService && selectedPricing);
    console.log("🔧 DEBUG - Button enabled check:", {
      selectedService: !!selectedService,
      selectedPricing: !!selectedPricing,
      serviceId: selectedService?._id,
      pricingId: selectedPricing?._id,
      enabled,
    });
    setIsButtonEnabled(enabled);
  }, [selectedService, selectedPricing]);

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
    console.log("🔍 Service ID:", service._id);
    console.log("📊 Pricing array:", service.pricing);
    console.log("📊 Pricing array length:", service.pricing?.length);

    if (service.pricing && service.pricing.length > 0) {
      console.log("📊 First pricing item:", service.pricing[0]);
      console.log("📊 First pricing ID:", service.pricing[0]?._id);
      console.log("📊 First pricing price:", service.pricing[0]?.price);
    } else {
      console.log("❌ WARNING: Service has NO pricing options!");
    }

    setSelectedService(service);
    setSelectedPricing(null);
    setSelectedStaffId(null);

    // Auto-select first pricing if available
    if (service.pricing && service.pricing.length > 0) {
      const firstPricing = service.pricing[0];
      console.log("💰 Auto-selecting first pricing:", firstPricing);
      console.log("💰 Auto-select - pricing ID:", firstPricing._id);
      console.log(
        "💰 Auto-select - pricing object:",
        JSON.stringify(firstPricing)
      );

      // ✅ IMPORTANT: Direct set karo
      setSelectedPricing(firstPricing);
    } else {
      console.log("⚠️ No pricing to auto-select");
    }
  };

  // Handle pricing select
  const handlePricingSelect = (pricing, e) => {
    if (e) e.stopPropagation();
    console.log("💰 Pricing selected:", pricing);
    console.log("💰 Pricing ID:", pricing._id);
    console.log("💰 Pricing object:", JSON.stringify(pricing));
    setSelectedPricing(pricing);
  };

  // Handle staff select
  const handleStaffSelect = (staffId) => {
    console.log("👤 Staff selected:", staffId);
    setSelectedStaffId(staffId);
  };

  // Handle add service
  const handleAddService = () => {
    console.log("🎯 Add button clicked!");
    console.log("🎯 Selected Service:", selectedService);
    console.log("🎯 Selected Pricing:", selectedPricing);
    console.log("🎯 Selected Staff:", selectedStaffId);
    console.log("🎯 Is button enabled?", isButtonEnabled);

    if (!selectedService || !selectedPricing) {
      console.error("❌ ERROR: Service or pricing not selected", {
        service: selectedService,
        pricing: selectedPricing,
      });
      message.error("Please select service and pricing");
      return;
    }

    const serviceData = {
      serviceId: selectedService._id,
      pricingId: selectedPricing._id,
      staffId: selectedStaffId,
      name: selectedService.name,
      duration:
        selectedPricing.durationMinutes || selectedPricing.duration || 30,
      price: selectedPricing.price || 0,
      categoryName: selectedService.category?.name || "Uncategorized",
    };

    console.log("✅ Adding service:", serviceData);

    // Call parent callback
    if (onServiceSelect) {
      onServiceSelect(serviceData);
      message.success(
        `Added ${selectedService.name} - ₹${selectedPricing.price}`
      );
    } else {
      console.error("❌ ERROR: onServiceSelect callback not provided!");
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

  // ✅ Helper to check if pricing is selected
  const isPricingSelected = (pricingId) => {
    const isSelected = selectedPricing?._id === pricingId;
    console.log(`🔎 Is pricing ${pricingId} selected?`, isSelected);
    return isSelected;
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
            {filteredServices.map((service) => {
              const isServiceSelected = selectedService?._id === service._id;

              return (
                <Card
                  key={service._id}
                  hoverable
                  className={`border transition-all cursor-pointer ${
                    isServiceSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:shadow-md hover:border-blue-300"
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

                      {/* Pricing Options */}
                      {service.pricing && service.pricing.length > 0 ? (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            {service.pricing.length} pricing option(s)
                          </div>
                          <div className="space-y-1">
                            {service.pricing.slice(0, 2).map((price) => (
                              <div
                                key={price._id}
                                className={`px-2 py-1 rounded border cursor-pointer transition-all ${
                                  isPricingSelected(price._id)
                                    ? "bg-blue-100 border-blue-400 text-blue-700"
                                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                                }`}
                                onClick={(e) => handlePricingSelect(price, e)}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium">
                                    {price.label || price.duration}
                                  </span>
                                  <span className="text-xs font-bold text-green-600">
                                    ₹{price.price}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {price.durationMinutes || price.duration || 0}{" "}
                                  mins
                                </div>
                              </div>
                            ))}
                            {service.pricing.length > 2 && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                +{service.pricing.length - 2} more options
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ No pricing available
                          </div>
                        </div>
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

                  {isServiceSelected && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs text-blue-600 font-medium">
                        ✓ Selected • Click pricing to choose
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Selected Service Details Panel */}
          {selectedService && (
            <div className="mt-6 p-6 bg-white border border-blue-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedService.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedService.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{selectedPricing?.price || "0"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedPricing?.durationMinutes ||
                      selectedPricing?.duration ||
                      "0"}{" "}
                    mins
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Pricing Selection Status */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-800">
                        Pricing Selection
                      </div>
                      <div className="text-sm text-blue-600">
                        {selectedPricing
                          ? `✓ Selected: ${
                              selectedPricing.label || selectedPricing.duration
                            }`
                          : "⚠️ Please select a pricing option"}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full ${
                        selectedPricing
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {selectedPricing ? "Ready" : "Pending"}
                    </div>
                  </div>
                </div>

                {/* Pricing Options */}
                {selectedService.pricing &&
                  selectedService.pricing.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">
                        Select Pricing Option:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedService.pricing.map((price) => (
                          <div
                            key={price._id}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              isPricingSelected(price._id)
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                            onClick={() => handlePricingSelect(price)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold">
                                  {price.label || price.duration}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {price.durationMinutes || price.duration} mins
                                </div>
                              </div>
                              <div className="text-xl font-bold text-green-600">
                                ₹{price.price}
                              </div>
                            </div>
                            {isPricingSelected(price._id) && (
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <div className="text-xs text-blue-600 font-medium flex items-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Currently selected
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Staff Selection */}
                {availableStaff.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">
                      Assign Staff (Optional):
                    </h4>
                    <Select
                      placeholder="Select staff member"
                      style={{ width: "100%", maxWidth: "400px" }}
                      value={selectedStaffId}
                      onChange={handleStaffSelect}
                      allowClear
                      size="large"
                    >
                      <Option value="">Not assigned (any available)</Option>
                      {getFilteredStaff().map((staff) => (
                        <Option key={staff._id} value={staff._id}>
                          <div className="flex items-center py-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
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
                  </div>
                )}

                {/* Add Button */}
                <div className="pt-6 border-t">
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleAddService}
                    disabled={!isButtonEnabled}
                    icon={<Plus />}
                    className={`h-12 text-lg font-semibold ${
                      isButtonEnabled
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400"
                    }`}
                  >
                    {isButtonEnabled
                      ? `Add "${selectedService.name}" to Walk-in`
                      : "Please select a pricing option"}
                  </Button>

                  {!isButtonEnabled && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-amber-700 text-sm">
                        <div className="font-medium mb-1">
                          Why is the button disabled?
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Select a service from the grid above</li>
                          <li>Choose a pricing option</li>
                          <li>Staff assignment is optional</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateServiceSelector;
