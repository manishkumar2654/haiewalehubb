// components/admin/BranchTypeManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  ColorPicker,
  message,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Typography,
  Divider,
  Badge,
  Empty,
  Descriptions,
  Select,
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApartmentOutlined,
  SortAscendingOutlined,
  InfoCircleOutlined,
  BranchesOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BranchTypeManagement = () => {
  const [branchTypes, setBranchTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedType, setSelectedType] = useState(null);
  const [form] = Form.useForm();

  // Initial form values
  const initialTypeValues = {
    name: "",
    description: "",
    colorCode: "#3B82F6",
    icon: "",
    order: 0,
    isActive: true,
  };

  // Icons options
  const iconOptions = [
    { value: "crown", label: "Crown", emoji: "👑" },
    { value: "star", label: "Star", emoji: "⭐" },
    { value: "diamond", label: "Diamond", emoji: "💎" },
    { value: "gem", label: "Gem", emoji: "💎" },
    { value: "trophy", label: "Trophy", emoji: "🏆" },
    { value: "medal", label: "Medal", emoji: "🏅" },
    { value: "building", label: "Building", emoji: "🏢" },
    { value: "bank", label: "Bank", emoji: "🏦" },
    { value: "hotel", label: "Hotel", emoji: "🏨" },
    { value: "house", label: "House", emoji: "🏠" },
    { value: "flag", label: "Flag", emoji: "🚩" },
    { value: "key", label: "Key", emoji: "🔑" },
    { value: "lock", label: "Lock", emoji: "🔒" },
    { value: "shield", label: "Shield", emoji: "🛡️" },
    { value: "rocket", label: "Rocket", emoji: "🚀" },
    { value: "fire", label: "Fire", emoji: "🔥" },
    { value: "sun", label: "Sun", emoji: "☀️" },
    { value: "moon", label: "Moon", emoji: "🌙" },
    { value: "heart", label: "Heart", emoji: "❤️" },
    { value: "bolt", label: "Bolt", emoji: "⚡" },
  ];

  // Fetch branch types
  const fetchBranchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/branch-types");
      if (res.data.success) {
        setBranchTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching branch types:", err);
      message.error("Failed to load branch types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchTypes();
  }, []);

  // Open modal for create/edit
  const openTypeModal = (mode = "create", type = null) => {
    setFormMode(mode);
    setSelectedType(type);

    if (mode === "edit" && type) {
      form.setFieldsValue({
        ...type,
        // Ensure all fields have values
        description: type.description || "",
        colorCode: type.colorCode || "#3B82F6",
        icon: type.icon || "",
        order: type.order || 0,
        isActive: type.isActive !== undefined ? type.isActive : true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue(initialTypeValues);
    }

    setModalVisible(true);
  };

  // Handle form submit
  const handleTypeSubmit = async (values) => {
    setLoading(true);
    try {
      const formattedValues = {
        ...values,
        order: Number(values.order) || 0,
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      if (formMode === "create") {
        const res = await api.post("/branch-types", formattedValues);
        if (res.data.success) {
          message.success("Branch type created successfully");
          fetchBranchTypes();
          setModalVisible(false);
          form.resetFields();
        }
      } else {
        const res = await api.put(
          `/branch-types/${selectedType._id}`,
          formattedValues
        );
        if (res.data.success) {
          message.success("Branch type updated successfully");
          fetchBranchTypes();
          setModalVisible(false);
          form.resetFields();
          setSelectedType(null);
        }
      }
    } catch (err) {
      console.error("Error saving branch type:", err);
      message.error(
        err.response?.data?.message || "Failed to save branch type"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete branch type
  const deleteType = async (typeId) => {
    try {
      const res = await api.delete(`/branch-types/${typeId}`);
      if (res.data.success) {
        message.success("Branch type deleted successfully");
        fetchBranchTypes();
      } else {
        message.error(res.data.message || "Failed to delete branch type");
      }
    } catch (err) {
      console.error("Error deleting branch type:", err);
      message.error(
        err.response?.data?.message || "Failed to delete branch type"
      );
    }
  };

  // Toggle type status
  const toggleTypeStatus = async (type) => {
    try {
      const res = await api.patch(`/branch-types/${type._id}/toggle-status`);
      if (res.data.success) {
        message.success(
          `Branch type ${
            type.isActive ? "deactivated" : "activated"
          } successfully`
        );
        fetchBranchTypes();
      }
    } catch (err) {
      console.error("Error toggling branch type status:", err);
      message.error("Failed to update status");
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedType(null);
    form.resetFields();
  };

  // Table columns
  const columns = [
    {
      title: "Type Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: record.colorCode || "#3B82F6",
              marginRight: 12,
              border: "2px solid white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <div>
            <Text strong style={{ fontSize: 15 }}>
              {text}
            </Text>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.description}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: (a, b) => a.order - b.order,
      render: (order) => (
        <Tag icon={<SortAscendingOutlined />} color="blue">
          {order || 0}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag
          color={isActive ? "green" : "red"}
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Color",
      dataIndex: "colorCode",
      key: "colorCode",
      render: (color) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: color || "#3B82F6",
              marginRight: 8,
              border: "1px solid #d9d9d9",
            }}
          />
          <Text code style={{ fontSize: 11 }}>
            {color || "#3B82F6"}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openTypeModal("edit", record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              type="link"
              icon={
                record.isActive ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              onClick={() => toggleTypeStatus(record)}
              danger={record.isActive}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this branch type?"
            description="This will permanently delete the branch type. Are you sure?"
            onConfirm={() => deleteType(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
            placement="topRight"
          >
            <Tooltip title="Delete">
              <Button
                type="link"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            <ApartmentOutlined style={{ marginRight: 8, color: "#722ed1" }} />
            Branch Types Management
          </Title>
          <Text type="secondary">
            Manage different categories of branches (e.g., Gold, Silver,
            Diamond)
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openTypeModal("create")}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
          }}
        >
          Add Branch Type
        </Button>
      </div>

      {/* Statistics Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Total Types"
              value={branchTypes.length}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Active Types"
              value={branchTypes.filter((t) => t.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Inactive Types"
              value={branchTypes.filter((t) => !t.isActive).length}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#fa541c" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable size="small">
            <Statistic
              title="Default Order"
              value={Math.max(...branchTypes.map((t) => t.order || 0))}
              prefix={<SortAscendingOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Branch Types Table */}
      {branchTypes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Title level={5} style={{ marginBottom: 8 }}>
                No Branch Types Found
              </Title>
              <Text type="secondary">
                Create your first branch type to categorize branches
              </Text>
            </div>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openTypeModal("create")}
          >
            Create First Type
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={branchTypes}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} types`,
          }}
          scroll={{ x: 800 }}
          expandable={{
            expandedRowRender: (record) => (
              <div
                style={{
                  margin: 0,
                  padding: 16,
                  background: "#fafafa",
                  borderRadius: 8,
                }}
              >
                <Descriptions
                  column={2}
                  size="small"
                  bordered
                  labelStyle={{ fontWeight: 600, width: 120 }}
                >
                  <Descriptions.Item label="Type ID" span={2}>
                    <Text code copyable>
                      {record._id}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Color Code">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          backgroundColor: record.colorCode || "#3B82F6",
                          border: "1px solid #d9d9d9",
                        }}
                      />
                      <Text>{record.colorCode || "#3B82F6"}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Icon">
                    {record.icon ? (
                      <Tag icon={<SettingOutlined />}>{record.icon}</Tag>
                    ) : (
                      <Text type="secondary">No icon</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {record.description || "No description"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated">
                    {record.updatedAt
                      ? new Date(record.updatedAt).toLocaleString()
                      : "-"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
          }}
        />
      )}

      {/* Branch Type Form Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ApartmentOutlined style={{ color: "#722ed1" }} />
            {formMode === "create"
              ? "Create New Branch Type"
              : "Edit Branch Type"}
            {selectedType && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {selectedType.name}
              </Tag>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        centered
        maskClosable={false}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTypeSubmit}
          initialValues={initialTypeValues}
          requiredMark="optional"
          size="large"
        >
          <Form.Item
            label="Type Name"
            name="name"
            rules={[
              { required: true, message: "Please enter type name" },
              { min: 2, message: "Name must be at least 2 characters" },
              { max: 50, message: "Name cannot exceed 50 characters" },
            ]}
            extra="e.g., Gold, Silver, Diamond, Premium, Standard"
          >
            <Input
              placeholder="Enter branch type name"
              prefix={<BranchesOutlined />}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 200, message: "Description cannot exceed 200 characters" },
            ]}
          >
            <TextArea
              placeholder="Enter description (optional)"
              rows={3}
              showCount
              maxLength={200}
              allowClear
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Color"
                name="colorCode"
                rules={[{ required: true, message: "Please select a color" }]}
              >
                <ColorPicker
                  format="hex"
                  showText
                  presets={[
                    {
                      label: "Recommended Colors",
                      colors: [
                        "#3B82F6", // Blue
                        "#10B981", // Green
                        "#F59E0B", // Yellow
                        "#EF4444", // Red
                        "#8B5CF6", // Purple
                        "#EC4899", // Pink
                        "#6366F1", // Indigo
                        "#14B8A6", // Teal
                        "#F97316", // Orange
                        "#84CC16", // Lime
                        "#06B6D4", // Cyan
                        "#8B5CF6", // Violet
                      ],
                    },
                  ]}
                  onChange={(color, hex) => {
                    form.setFieldValue("colorCode", hex);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <span>Select Color</span>
                  </div>
                </ColorPicker>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Display Order"
                name="order"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Order must be 0 or greater",
                  },
                ]}
                extra="Lower numbers appear first"
              >
                <InputNumber
                  placeholder="Order"
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  precision={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Icon"
            name="icon"
            extra="Select an icon for visual representation"
          >
            <Select
              placeholder="Select an icon"
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {iconOptions.map((icon) => (
                <Option key={icon.value} value={icon.value} label={icon.label}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 16 }}>{icon.emoji}</span>
                    <span>{icon.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="isActive"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
            />
          </Form.Item>

          <Divider />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              onClick={handleModalClose}
              icon={<CloseOutlined />}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={formMode === "create" ? <PlusOutlined /> : <SaveOutlined />}
              size="large"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                minWidth: 120,
              }}
            >
              {formMode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchTypeManagement;
