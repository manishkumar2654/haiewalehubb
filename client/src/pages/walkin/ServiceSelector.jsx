import React, { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Input, Select, Table, Card, Tag } from "antd";
import ServiceModal from "./ServiceModal";

const { Option } = Select;

const ServiceSelector = ({
  formData,
  setFormData,
  services,
  categories,
  availableStaff,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenServiceModal = (service) => {
    console.log("Opening modal for service:", service.name); // Debug log
    setSelectedService(service);
    setIsServiceModalVisible(true);
  };

  // ServiceSelector.jsx - FIX the handleServiceSelect function
  // In ServiceModal.jsx se proper data receive karo:

  const handleServiceSelect = (serviceId, pricingId, selectedStaffId) => {
    console.log("Selecting service:", serviceId, pricingId, selectedStaffId);

    const service = services.find((s) => s._id === serviceId);
    if (!service) {
      console.error("Service not found:", serviceId);
      return;
    }

    const pricing = service.pricing?.find((p) => p._id === pricingId);
    if (!pricing) {
      console.error("Pricing not found:", pricingId);
      return;
    }

    const newService = {
      serviceId,
      pricingId,
      categoryId: service.category?._id || "",
      name: service.name,
      duration: pricing.durationMinutes || 0,
      price: pricing.price || 0,
      staffId: selectedStaffId || null,
      categoryName: service.category?.name || "Uncategorized",
      pricingLabel: pricing.label || pricing.duration || "Standard",
    };

    console.log("✅ Created new service object:", newService);

    // 🚨 CRITICAL FIX: Directly call props function with data
    if (typeof setFormData === "function") {
      // Check if setFormData expects a function or object
      setFormData((prev) => ({
        ...prev,
        selectedServices: [...prev.selectedServices, newService],
      }));

      // Also trigger any callback if provided
      if (typeof props.onServiceSelect === "function") {
        props.onServiceSelect(newService);
      }
    }

    setIsServiceModalVisible(false);
    setSelectedService(null);
    message.success(`Added ${service.name} - ₹${pricing.price}`);
  };

  const handleStaffAssignment = (serviceId, staffId) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.map((service) =>
        service.serviceId === serviceId ? { ...service, staffId } : service
      ),
    }));
  };

  const handleRemoveService = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter(
        (service) => service.serviceId !== serviceId
      ),
    }));
  };

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

  const columns = [
    {
      title: "Service",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration || 0} mins`,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price || 0}`,
    },
    // Staff column in ServiceSelector.jsx:
    // ServiceSelector.jsx - staff column update karo:
    {
      title: "Staff",
      key: "staff",
      render: (_, record) => {
        console.log("=== STAFF COLUMN DEBUG ===");
        console.log("Record serviceId:", record.serviceId);
        console.log("Record name:", record.name);

        // Find the service
        const service = services.find((s) => s._id === record.serviceId);
        console.log("Service found:", service?.name);

        // Get category ID
        const categoryId =
          service?.category?._id || service?.category || record.categoryId;
        console.log("Category ID:", categoryId);

        // Find category
        const category = categories.find((c) => c._id === categoryId);
        console.log("Category found:", category?.name);
        console.log(
          "Category assignedEmployeeRole:",
          category?.assignedEmployeeRole
        );

        // Required role
        const requiredRole =
          category?.assignedEmployeeRole?.toLowerCase() || "";
        console.log("Required role (lowercase):", requiredRole);

        // Check available staff
        console.log(
          "Available staff:",
          availableStaff.map((s) => ({
            name: s.name,
            role: s.employeeRole,
            roleLower: s.employeeRole?.toLowerCase(),
          }))
        );

        // Filter staff
        const filteredStaff = availableStaff.filter((staff) => {
          if (!requiredRole) return true;

          const staffRole = staff.employeeRole?.toLowerCase() || "";
          console.log(
            `Comparing: staff="${staffRole}" vs required="${requiredRole}"`
          );

          return staffRole === requiredRole;
        });

        console.log("Filtered staff count:", filteredStaff.length);
        console.log(
          "Filtered staff:",
          filteredStaff.map((s) => s.name)
        );
        console.log("=== END DEBUG ===");

        return (
          <Select
            placeholder={
              filteredStaff.length === 0
                ? `No ${requiredRole || "matching"} staff`
                : `Assign ${requiredRole || "staff"}`
            }
            style={{ width: 200 }}
            value={record.staffId}
            onChange={(value) => handleStaffAssignment(record.serviceId, value)}
            allowClear
            disabled={filteredStaff.length === 0}
          >
            <Option value="">Not assigned</Option>
            {filteredStaff.map((staff) => (
              <Option key={staff._id} value={staff._id}>
                {staff.name} ({staff.employeeRole || "Staff"})
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex justify-center">
          <Trash2
            className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
            onClick={() => handleRemoveService(record.serviceId)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
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
              : "No services available. Please add services first."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card
                key={service._id}
                hoverable
                className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenServiceModal(service)}
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
                            color="blue"
                            className="mr-1 mb-1"
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

          {/* Selected Services Table */}
          {formData.selectedServices.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-[poppins] font-semibold mb-4">
                Selected Services ({formData.selectedServices.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <Table
                  dataSource={formData.selectedServices}
                  columns={columns}
                  pagination={false}
                  size="small"
                  rowKey="serviceId"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Service Modal - Always render but control visibility */}
      <ServiceModal
        visible={isServiceModalVisible}
        service={selectedService}
        onCancel={() => {
          console.log("Closing modal");
          setIsServiceModalVisible(false);
          setSelectedService(null);
        }}
        onSelect={handleServiceSelect}
      />
    </div>
  );
};

export default ServiceSelector;
