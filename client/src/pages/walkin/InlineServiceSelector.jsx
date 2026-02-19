// InlineServiceSelector.jsx - Service selection modal for walk-in table
import React, { useState, useEffect, useMemo } from "react";
import { Modal, Card, Tag, Button, Input, Select, Table, message } from "antd";
import { Search, Plus, X } from "lucide-react";
import ServiceModal from "./ServiceModal";
import api from "../../services/api";

const { Option } = Select;

const InlineServiceSelector = ({
  // ✅ support both (antd v6 prefers open, old code uses visible)
  open,
  visible,
  onClose,
  walkin,
  services = [],
  categories = [],
  onServicesSelected,
}) => {
  const isOpen = open ?? visible ?? false;

  const [selectedServices, setSelectedServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("");
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch all employees
  useEffect(() => {
    if (isOpen) fetchAllEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    if (isOpen && walkin) {
      const existingServices = (walkin.services || []).map((s) => ({
        serviceId: String(s.service?._id || s.service),
        pricingId: String(s.pricing?._id || s.pricing),
        staffId: s.staff?._id ? String(s.staff._id) : s.staff ? String(s.staff) : null,
        name: s.service?.name || "Service",
        price: Number(s.price) || 0,
        duration: Number(s.duration) || 0,
        categoryName: s.category?.name || "Uncategorized",
      }));
      setSelectedServices(existingServices);
    } else if (!isOpen) {
      // ✅ keep it clean when modal closes
      setSearchTerm("");
      setFilteredCategory("");
      setIsServiceModalVisible(false);
      setSelectedService(null);
    }
  }, [isOpen, walkin]);

  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setIsServiceModalVisible(true);
  };

  const handleServiceSelect = (serviceId, pricingId, selectedStaffId) => {
    const serviceIdStr = String(serviceId);
    const pricingIdStr = String(pricingId);

    const service = services.find((s) => String(s._id) === serviceIdStr);
    if (!service) {
      message.error("Service not found!");
      return;
    }

    const pricing = service.pricing?.find((p) => String(p._id) === pricingIdStr);
    if (!pricing) {
      console.error(
        "❌ Pricing not found. Available pricing:",
        service.pricing?.map((p) => p._id)
      );
      message.error("Pricing option not found!");
      return;
    }

    const category = categories.find(
      (c) => String(c._id) === String(service.category?._id || service.category)
    );

    const newService = {
      serviceId: serviceIdStr,
      pricingId: pricingIdStr,
      staffId: selectedStaffId ? String(selectedStaffId) : null,
      name: service.name,
      price: Number(pricing.price) || 0,
      duration: Number(pricing.durationMinutes || pricing.duration || 0),
      categoryName: category?.name || "Uncategorized",
    };

    // ✅ fix: compare string-to-string (aapke code me mixed compare tha)
    const exists = selectedServices.find(
      (s) => String(s.serviceId) === serviceIdStr && String(s.pricingId) === pricingIdStr
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
    onServicesSelected?.(selectedServices);
    // ✅ parent will handle open-after-save logic
    onClose?.();
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = searchTerm
        ? service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const matchesCategory = filteredCategory
        ? String(service.category?._id || service.category) === String(filteredCategory)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, filteredCategory]);

  const columns = [
    { title: "Service", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "categoryName", key: "categoryName" },
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
        open={isOpen}
        onCancel={onClose}
        width={900}
        maskClosable={false}
        keyboard={false}
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
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search services..."
              prefix={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 300, maxWidth: "100%" }}
              allowClear
            />
            <Select
              placeholder="Filter by category"
              style={{ width: 200, maxWidth: "100%" }}
              value={filteredCategory || undefined}
              onChange={(v) => setFilteredCategory(v || "")}
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
                styles={{ body: { padding: 16 } }}
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
                rowKey={(record, index) => `${record.serviceId}-${record.pricingId}-${index}`}
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

      {/* ✅ Service Modal (pass both open+visible to avoid silent fail) */}
      <ServiceModal
        open={isServiceModalVisible}
        visible={isServiceModalVisible}
        service={selectedService}
        onCancel={() => {
          setIsServiceModalVisible(false);
          setSelectedService(null);
        }}
        onSelect={handleServiceSelect}
        categories={categories}
        availableStaff={allEmployees}
      />
    </>
  );
};

export default InlineServiceSelector;
