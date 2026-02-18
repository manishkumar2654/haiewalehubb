import React, { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Input, Select, Table, Card, Tag, message } from "antd"; // ADD MESSAGE
import ServiceModal from "./ServiceModal";

const { Option } = Select;

const ServiceSelector = ({
  formData,
  setFormData,
  services,
  categories,
  availableStaff,
  // REMOVE props.onServiceSelect if not used
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenServiceModal = (service) => {
    console.log("📦 Service clicked:", service.name); // Debug log
    setSelectedService(service);
    setIsServiceModalVisible(true);
  };

  // ✅ FIXED: Proper service select handler
  const handleServiceSelect = (serviceId, pricingId, selectedStaffId) => {
    console.log("✅ Service selected in ServiceSelector:", {
      serviceId,
      pricingId,
      selectedStaffId,
    });

    // Find the service
    const service = services.find((s) => s._id === serviceId);
    if (!service) {
      console.error("Service not found:", serviceId);
      message.error("Service not found!");
      return;
    }

    // Find pricing
    const pricing = service.pricing?.find((p) => p._id === pricingId);
    if (!pricing) {
      console.error("Pricing not found:", pricingId);
      message.error("Pricing option not found!");
      return;
    }

    // Find category
    const category = categories.find(
      (c) => c._id === service.category?._id || service.category
    );

    // Create service data
    const newService = {
      serviceId,
      pricingId,
      categoryId: service.category?._id || service.category || "",
      categoryName: category?.name || "Uncategorized",
      name: service.name,
      duration: pricing.durationMinutes || pricing.duration || 0,
      price: pricing.price || 0,
      staffId: selectedStaffId || null,
      pricingLabel: pricing.label || pricing.duration || "Standard",
    };

    console.log("🎯 Adding service to form:", newService);

    // Add to selected services
    setFormData((prev) => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newService],
    }));

    setIsServiceModalVisible(false);
    setSelectedService(null);
    message.success(`Added ${service.name} - ₹${pricing.price}`);
  };

  const handleStaffAssignment = (serviceId, staffId) => {
    console.log("👤 Staff selected:", staffId);

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
    message.info("Service removed");
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

  // ✅ FIXED: Staff column with better debugging
  const getFilteredStaffForService = (service) => {
    if (!service) return availableStaff;

    const serviceObj = services.find((s) => s._id === service.serviceId);
    if (!serviceObj) return availableStaff;

    const categoryId = serviceObj.category?._id || serviceObj.category;
    const category = categories.find((c) => c._id === categoryId);

    if (!category?.assignedEmployeeRole) return availableStaff;

    const requiredRole = category.assignedEmployeeRole.toLowerCase();

    return availableStaff.filter((staff) => {
      const staffRole = staff.employeeRole?.toLowerCase() || "";
      return staffRole === requiredRole;
    });
  };

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
    {
      title: "Staff",
      key: "staff",
      render: (_, record) => {
        const filteredStaff = getFilteredStaffForService(record);
        const serviceObj = services.find((s) => s._id === record.serviceId);
        const categoryId = serviceObj?.category?._id || serviceObj?.category;
        const category = categories.find((c) => c._id === categoryId);
        const requiredRole = category?.assignedEmployeeRole || "Any";

        return (
          <Select
            placeholder={`Assign ${requiredRole}`}
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
              <h3 className="text-lg font-[poppins] font-semibold mb-4 text-black">
                Selected Services ({formData.selectedServices.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <Table
                  dataSource={formData.selectedServices}
                  columns={columns}
                  pagination={false}
                  size="small"
                  rowKey="serviceId"
                  className="custom-table"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Service Modal */}
      <ServiceModal
        visible={isServiceModalVisible}
        service={selectedService}
        onCancel={() => {
          console.log("Closing modal");
          setIsServiceModalVisible(false);
          setSelectedService(null);
        }}
        onSelect={handleServiceSelect}
        // NEW PROPS ADD KARO:
        categories={categories}
        availableStaff={availableStaff}
      />

      {/* Global Styles */}
      <style jsx global>{`
        .custom-table .ant-table {
          color: black;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: black !important;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }

        .custom-table .ant-table-tbody > tr > td {
          color: black;
          border-bottom: 1px solid #f0f0f0;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
};

export default ServiceSelector;
