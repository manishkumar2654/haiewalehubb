// InlineServiceSelector.jsx - Service selection modal for walk-in table
import React, { useState, useEffect } from "react";
import { Modal, Card, Tag, Button, Input, Select, Table, message } from "antd";
import { Search, Plus, X } from "lucide-react";
import ServiceModal from "./ServiceModal";
import api from "../../services/api";

const { Option } = Select;

const InlineServiceSelector = ({
  visible,
  onClose,
  walkin,
  services,
  categories,
  onServicesSelected,
}) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch all employees (no role filtering)
  useEffect(() => {
    if (visible) {
      fetchAllEmployees();
    }
  }, [visible]);

  const fetchAllEmployees = async () => {
    try {
      const res = await api.get("/admin/users?role=employee");
      setAllEmployees(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setAllEmployees([]);
    }
  };

  // Initialize with existing services
  useEffect(() => {
    if (visible && walkin) {
      const existingServices = (walkin.services || []).map((s) => ({
        serviceId: s.service?._id || s.service,
        pricingId: s.pricing?._id || s.pricing,
        staffId: s.staff?._id || s.staff,
        name: s.service?.name || "Service",
        price: s.price || 0,
        duration: s.duration || 0,
        categoryName: s.category?.name || "Uncategorized",
      }));
      setSelectedServices(existingServices);
    }
  }, [visible, walkin]);

  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setIsServiceModalVisible(true);
  };

  const handleServiceSelect = (serviceId, pricingId, selectedStaffId) => {
    console.log("🎯 Service selected:", { serviceId, pricingId, selectedStaffId });
    
    const service = services.find((s) => s._id === serviceId);
    if (!service) {
      message.error("Service not found!");
      return;
    }

    // Ensure pricingId is a string for comparison
    const pricingIdStr = String(pricingId);
    const pricing = service.pricing?.find((p) => {
      const pIdStr = String(p._id);
      return pIdStr === pricingIdStr;
    });
    
    if (!pricing) {
      console.error("❌ Pricing not found. Available pricing:", service.pricing?.map(p => p._id));
      message.error("Pricing option not found!");
      return;
    }

    const category = categories.find(
      (c) => c._id === service.category?._id || service.category
    );

    const newService = {
      serviceId: String(serviceId), // Ensure string
      pricingId: pricingIdStr, // Use the string version
      staffId: selectedStaffId ? String(selectedStaffId) : null,
      name: service.name,
      price: Number(pricing.price) || 0,
      duration: Number(pricing.durationMinutes || pricing.duration || 0),
      categoryName: category?.name || "Uncategorized",
    };
    
    console.log("✅ New service object:", newService);

    // Check if already selected
    const exists = selectedServices.find(
      (s) => s.serviceId === serviceId && s.pricingId === pricingId
    );

    if (exists) {
      message.warning("Service already selected!");
      return;
    }

    setSelectedServices((prev) => [...prev, newService]);
    setIsServiceModalVisible(false);
    setSelectedService(null);
    message.success(`Added ${service.name} - ₹${pricing.price}`);
  };

  const handleRemoveService = (index) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
    message.info("Service removed");
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      message.warning("Please select at least one service");
      return;
    }
    onServicesSelected(selectedServices);
    onClose();
  };

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
      render: (dur) => `${dur || 0} mins`,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price || 0}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record, index) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<X className="w-3 h-3" />}
          onClick={() => handleRemoveService(index)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`Select Services - ${walkin?.walkinNumber || ""}`}
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Save Services ({selectedServices.length})
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
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
              onChange={setFilteredCategory}
              allowClear
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
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
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {service.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {service.category?.name || "Uncategorized"}
                    </p>
                    {service.pricing && service.pricing.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {service.pricing.slice(0, 2).map((price) => (
                          <Tag key={price._id} color="blue" className="mr-1 mb-1">
                            {price.label || price.duration}: ₹{price.price}
                          </Tag>
                        ))}
                        {service.pricing.length > 2 && (
                          <Tag color="cyan" className="text-xs">
                            +{service.pricing.length - 2} more
                          </Tag>
                        )}
                      </div>
                    ) : (
                      <Tag color="orange" className="mt-2">
                        No pricing
                      </Tag>
                    )}
                  </div>
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
              </Card>
            ))}
          </div>

          {/* Selected Services Table */}
          {selectedServices.length > 0 && (
            <Card size="small" title={`Selected Services (${selectedServices.length})`}>
              <Table
                dataSource={selectedServices}
                columns={columns}
                pagination={false}
                size="small"
                rowKey={(record, index) => `${record.serviceId}-${index}`}
              />
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Services Price:</span>
                  <span className="text-green-600">
                    ₹
                    {selectedServices
                      .reduce((sum, s) => sum + (s.price || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Modal>

      {/* Service Modal */}
      <ServiceModal
        visible={isServiceModalVisible}
        service={selectedService}
        onCancel={() => {
          setIsServiceModalVisible(false);
          setSelectedService(null);
        }}
        onSelect={handleServiceSelect}
        categories={categories}
        availableStaff={allEmployees} // All employees (no role filtering)
      />
    </>
  );
};

export default InlineServiceSelector;
