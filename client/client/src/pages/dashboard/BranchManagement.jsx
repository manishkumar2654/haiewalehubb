// components/admin/BranchManagement.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Tabs,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Divider,
  Typography,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  Statistic,
  Progress,
  Descriptions,
  Empty,
  Collapse,
  Alert,
  List,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  StarOutlined,
  BuildOutlined,
  BankOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  NumberOutlined,
  UserOutlined,
  ArrowRightOutlined,
  ApartmentOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  DashboardOutlined,
  MailOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import SeatManagementModal from "./SeatManagementModal";
import BranchTypeManagement from "./BranchTypeManagement";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const BranchManagement = () => {
  const [activeTab, setActiveTab] = useState("branches");
  const [branches, setBranches] = useState([]);
  const [branchTypes, setBranchTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [seatModalVisible, setSeatModalVisible] = useState(false);
  const [selectedBranchForSeats, setSelectedBranchForSeats] = useState(null);
  const [form] = Form.useForm();
  const [formType] = Form.useForm();

  // Form states
  const [formMode, setFormMode] = useState("create"); // 'create' or 'edit'
  const [typeFormMode, setTypeFormMode] = useState("create");

  // Initial form values
  const initialBranchValues = {
    name: "",
    branchType: "",
    address: "",
    phone: "",
    landline: "",
    workingHours: "9:00 AM - 9:00 PM",
    totalSeats: 0,
    availableSeats: 0,
    premium: false,
    isActive: true,
    manager: {
      name: "",
      contact: "",
      email: "",
    },
    facilities: [],
    location: {
      lat: "",
      lng: "",
    },
  };

  const initialTypeValues = {
    name: "",
    description: "",
    colorCode: "#3B82F6",
    icon: "",
    order: 0,
    isActive: true,
  };

  // Fetch branch types
  const fetchBranchTypes = async () => {
    try {
      const res = await api.get("/branch-types/active");
      if (res.data.success) {
        setBranchTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching branch types:", err);
      message.error("Failed to load branch types");
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await api.get("/admin/branches/");
      if (res.data.success) {
        setBranches(res.data.data);
      } else {
        message.error(res.data.message || "Failed to load branches");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      message.error("Failed to load branches");
    } finally {
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    fetchBranchTypes();
    fetchBranches();
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Open branch modal
  const openBranchModal = (mode = "create", branch = null) => {
    setFormMode(mode);
    setSelectedBranch(branch);

    if (mode === "edit" && branch) {
      form.setFieldsValue({
        ...branch,
        branchType: branch.branchType?._id || branch.branchType,
        manager: branch.manager || {},
        location: branch.location || {},
        facilities: branch.facilities || [],
      });
    } else {
      form.resetFields();
    }

    setModalVisible(true);
  };

  // Handle branch form submit
  const handleBranchSubmit = async (values) => {
    setLoading(true);
    try {
      // Format the data
      const formattedData = {
        ...values,
        manager: values.manager || {},
        location: values.location || {},
        facilities: values.facilities || [],
      };

      if (formMode === "create") {
        const res = await api.post("/admin/branches", formattedData);
        if (res.data.success) {
          message.success("Branch created successfully");
          fetchBranches();
          setModalVisible(false);
          form.resetFields();
        } else {
          message.error(res.data.message || "Failed to create branch");
        }
      } else {
        const res = await api.put(
          `/admin/branches/${selectedBranch._id}`,
          formattedData
        );
        if (res.data.success) {
          message.success("Branch updated successfully");
          fetchBranches();
          setModalVisible(false);
          form.resetFields();
        } else {
          message.error(res.data.message || "Failed to update branch");
        }
      }
    } catch (err) {
      console.error("Error saving branch:", err);
      message.error(err.response?.data?.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  // Delete branch
  const deleteBranch = async (branchId) => {
    try {
      const res = await api.delete(`/admin/branches/${branchId}`);
      if (res.data.success) {
        message.success("Branch deleted successfully");
        fetchBranches();
      } else {
        message.error(res.data.message || "Failed to delete branch");
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
      message.error(err.response?.data?.message || "Failed to delete branch");
    }
  };

  // Toggle branch status
  const toggleBranchStatus = async (branch) => {
    try {
      const res = await api.patch(
        `/admin/branches/${branch._id}/toggle-status`,
        {
          isActive: !branch.isActive,
        }
      );
      if (res.data.success) {
        message.success(
          `Branch ${branch.isActive ? "deactivated" : "activated"} successfully`
        );
        fetchBranches();
      }
    } catch (err) {
      console.error("Error toggling branch status:", err);
      message.error("Failed to update branch status");
    }
  };

  // Open seat management modal
  const openSeatManagement = (branch) => {
    setSelectedBranchForSeats(branch);
    setSeatModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Available":
        return "green";
      case "Inactive":
      case "Booked":
        return "red";
      case "Maintenance":
        return "orange";
      case "Reserved":
        return "blue";
      default:
        return "default";
    }
  };

  // Get badge color for seat availability
  const getSeatBadgeColor = (availableSeats, totalSeats) => {
    const percentage = totalSeats > 0 ? (availableSeats / totalSeats) * 100 : 0;
    if (percentage === 0) return "red";
    if (percentage < 30) return "orange";
    if (percentage < 70) return "yellow";
    return "green";
  };

  // Branch columns for table
  const branchColumns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size="small"
            style={{
              backgroundColor: record.branchType?.colorCode || "#3B82F6",
              marginRight: 8,
            }}
            icon={<BankOutlined />}
          />
          <div>
            <Text strong>{text}</Text>
            <div>
              <Tag color="blue" size="small">
                {record.code || "N/A"}
              </Tag>
              {record.branchType && (
                <Tag color={record.branchType.colorCode || "blue"} size="small">
                  {record.branchType.name}
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (text) => (
        <div>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phone",
      key: "phone",
      render: (phone, record) => (
        <div>
          <div>
            <PhoneOutlined style={{ marginRight: 5 }} />
            {phone}
          </div>
          {record.landline && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Landline: {record.landline}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Seats",
      key: "seats",
      render: (_, record) => (
        <div>
          <Progress
            percent={
              record.totalSeats > 0
                ? Math.round((record.availableSeats / record.totalSeats) * 100)
                : 0
            }
            size="small"
            status={getSeatBadgeColor(record.availableSeats, record.totalSeats)}
            format={() => (
              <Text strong>
                {record.availableSeats}/{record.totalSeats}
              </Text>
            )}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
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
      title: "Premium",
      dataIndex: "premium",
      key: "premium",
      render: (premium) =>
        premium ? (
          <Tag color="gold" icon={<StarOutlined />}>
            Premium
          </Tag>
        ) : null,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openBranchModal("edit", record)}
            />
          </Tooltip>
          <Tooltip title="Manage Seats">
            <Button
              type="link"
              icon={<TeamOutlined />}
              onClick={() => openSeatManagement(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openBranchModal("edit", record)}
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
              onClick={() => toggleBranchStatus(record)}
              danger={record.isActive}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this branch?"
            onConfirm={() => deleteBranch(record._id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Tooltip title="Delete">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Branch statistics
  const branchStats = {
    total: branches.length,
    active: branches.filter((b) => b.isActive).length,
    premium: branches.filter((b) => b.premium).length,
    byType: branchTypes.map((type) => ({
      ...type,
      count: branches.filter(
        (b) => b.branchType?._id === type._id || b.branchType === type._id
      ).length,
    })),
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fdfcfb 0%, #f6f4f2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: 24 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
                <BankOutlined style={{ marginRight: 12, color: "#1890ff" }} />
                Branch Management System
              </Title>
              <Text type="secondary">
                Manage branch types, branches, and seats across all locations
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => openBranchModal("create")}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: 8,
                height: 48,
                padding: "0 24px",
                fontWeight: 600,
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              Add New Branch
            </Button>
          </div>

          {/* Statistics Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title="Total Branches"
                  value={branchStats.total}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title="Active Branches"
                  value={branchStats.active}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title="Premium Branches"
                  value={branchStats.premium}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Statistic
                  title="Branch Types"
                  value={branchTypes.length}
                  prefix={<ApartmentOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Branch Types Summary */}
          {branchStats.byType.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              {branchStats.byType.map((type) => (
                <Col xs={24} sm={12} md={8} lg={6} key={type._id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      borderLeft: `4px solid ${type.colorCode}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: `${type.colorCode}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <BankOutlined
                          style={{ color: type.colorCode, fontSize: 18 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 16, display: "block" }}>
                          {type.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {type.description}
                        </Text>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: 24, color: type.colorCode }}
                      >
                        {type.count}
                      </Text>
                      <Tag color="blue">Branches</Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Main Tabs */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            tabBarExtraContent={
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  icon={<DashboardOutlined />}
                  onClick={() => fetchBranches()}
                  loading={branchLoading}
                >
                  Refresh
                </Button>
                {activeTab === "branches" && (
                  <Button
                    type="primary"
                    icon={<AppstoreAddOutlined />}
                    onClick={() => openBranchModal("create")}
                  >
                    Add Branch
                  </Button>
                )}
              </div>
            }
            style={{ marginTop: -16 }}
          >
            {/* Branches Tab */}
            <TabPane
              tab={
                <span>
                  <BankOutlined />
                  Branches
                  <Badge
                    count={branches.length}
                    style={{ marginLeft: 8, backgroundColor: "#1890ff" }}
                  />
                </span>
              }
              key="branches"
            >
              <Table
                columns={branchColumns}
                dataSource={branches}
                rowKey="_id"
                loading={branchLoading}
                pagination={{ pageSize: 10 }}
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
                        bordered
                        size="small"
                        labelStyle={{ fontWeight: 600 }}
                      >
                        <Descriptions.Item label="Branch Code">
                          <Tag color="blue">{record.code || "N/A"}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Working Hours">
                          <ClockCircleOutlined style={{ marginRight: 8 }} />
                          {record.workingHours}
                        </Descriptions.Item>
                        <Descriptions.Item label="Manager" span={2}>
                          {record.manager?.name ? (
                            <div>
                              <IdcardOutlined style={{ marginRight: 8 }} />
                              {record.manager.name}
                              {record.manager.contact && (
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 16 }}
                                >
                                  <PhoneOutlined style={{ marginRight: 4 }} />
                                  {record.manager.contact}
                                </Text>
                              )}
                              {record.manager.email && (
                                <Text
                                  type="secondary"
                                  style={{ marginLeft: 16 }}
                                >
                                  <MailOutlined style={{ marginRight: 4 }} />
                                  {record.manager.email}
                                </Text>
                              )}
                            </div>
                          ) : (
                            "Not assigned"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Facilities" span={2}>
                          {record.facilities && record.facilities.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 4,
                              }}
                            >
                              {record.facilities.map((facility, index) => (
                                <Tag key={index} color="cyan">
                                  {facility}
                                </Tag>
                              ))}
                            </div>
                          ) : (
                            "No facilities listed"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Location" span={2}>
                          {record.location?.lat && record.location?.lng ? (
                            <div>
                              Lat: {record.location.lat}, Lng:{" "}
                              {record.location.lng}
                            </div>
                          ) : (
                            "Location not set"
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                      <Divider />
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          type="primary"
                          icon={<TeamOutlined />}
                          onClick={() => openSeatManagement(record)}
                        >
                          Manage Seats
                        </Button>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => openBranchModal("edit", record)}
                        >
                          Edit Details
                        </Button>
                        <Button
                          type="dashed"
                          icon={<EnvironmentOutlined />}
                          onClick={() => {
                            if (record.location?.lat && record.location?.lng) {
                              window.open(
                                `https://maps.google.com/?q=${record.location.lat},${record.location.lng}`,
                                "_blank"
                              );
                            } else {
                              message.warning(
                                "Location coordinates not available"
                              );
                            }
                          }}
                        >
                          View on Map
                        </Button>
                      </div>
                    </div>
                  ),
                }}
              />
            </TabPane>

            {/* Branch Types Tab */}
            <TabPane
              tab={
                <span>
                  <ApartmentOutlined />
                  Branch Types
                  <Badge
                    count={branchTypes.length}
                    style={{ marginLeft: 8, backgroundColor: "#722ed1" }}
                  />
                </span>
              }
              key="types"
            >
              <BranchTypeManagement
                branchTypes={branchTypes}
                fetchBranchTypes={fetchBranchTypes}
                initialTypeValues={initialTypeValues}
              />
            </TabPane>

            {/* Seats Overview Tab */}
            <TabPane
              tab={
                <span>
                  <TeamOutlined />
                  Seats Overview
                </span>
              }
              key="seats"
            >
              <SeatOverview branches={branches} />
            </TabPane>
          </Tabs>
        </Card>

        {/* Branch Form Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <BankOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              {formMode === "create" ? "Add New Branch" : "Edit Branch"}
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          centered
          maskClosable={false}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleBranchSubmit}
            initialValues={initialBranchValues}
            requiredMark="optional"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Branch Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter branch name" },
                  ]}
                >
                  <Input
                    placeholder="Enter branch name"
                    prefix={<BankOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Branch Type"
                  name="branchType"
                  rules={[
                    { required: true, message: "Please select branch type" },
                  ]}
                >
                  <Select
                    placeholder="Select branch type"
                    size="large"
                    suffixIcon={<ApartmentOutlined />}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {branchTypes.map((type) => (
                      <Option key={type._id} value={type._id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: type.colorCode,
                              marginRight: 8,
                            }}
                          />
                          {type.name}
                          <Text
                            type="secondary"
                            style={{ marginLeft: 8, fontSize: 12 }}
                          >
                            ({type.description})
                          </Text>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Please enter valid 10-digit phone number",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter 10-digit phone number"
                    prefix={<PhoneOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Landline" name="landline">
                  <Input
                    placeholder="Enter landline number"
                    prefix={<PhoneOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <TextArea
                placeholder="Enter full address"
                rows={3}
                size="large"
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Working Hours" name="workingHours">
                  <Input
                    placeholder="e.g., 9:00 AM - 9:00 PM"
                    prefix={<ClockCircleOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Facilities" name="facilities">
                  <Select
                    mode="tags"
                    placeholder="Add facilities"
                    size="large"
                    suffixIcon={<BuildOutlined />}
                    tokenSeparators={[","]}
                    allowClear
                  >
                    <Option value="WiFi">WiFi</Option>
                    <Option value="Parking">Parking</Option>
                    <Option value="AC">AC</Option>
                    <Option value="TV">TV</Option>
                    <Option value="Cafeteria">Cafeteria</Option>
                    <Option value="Waiting Area">Waiting Area</Option>
                    <Option value="Changing Room">Changing Room</Option>
                    <Option value="Free Consultation">Free Consultation</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain>
              Location Details
            </Divider>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label="Latitude"
                  name={["location", "lat"]}
                  rules={[
                    {
                      pattern:
                        /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/,
                      message: "Enter valid latitude (-90 to 90)",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 22.7196"
                    style={{ width: "100%" }}
                    size="large"
                    min={-90}
                    max={90}
                    step={0.000001}
                    precision={6}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Longitude"
                  name={["location", "lng"]}
                  rules={[
                    {
                      pattern:
                        /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/,
                      message: "Enter valid longitude (-180 to 180)",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="e.g., 75.8577"
                    style={{ width: "100%" }}
                    size="large"
                    min={-180}
                    max={180}
                    step={0.000001}
                    precision={6}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain>
              Manager Details
            </Divider>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Manager Name" name={["manager", "name"]}>
                  <Input
                    placeholder="Manager name"
                    prefix={<UserOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Contact" name={["manager", "contact"]}>
                  <Input
                    placeholder="Contact number"
                    prefix={<PhoneOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Email"
                  name={["manager", "email"]}
                  rules={[
                    { type: "email", message: "Please enter valid email" },
                  ]}
                >
                  <Input
                    placeholder="Email address"
                    prefix={<MailOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left" plain>
              Settings
            </Divider>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="Premium Branch"
                  name="premium"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Premium"
                    unCheckedChildren="Standard"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
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
              </Col>
              <Col span={8}>
                <Form.Item label="Initial Seats" name="totalSeats">
                  <InputNumber
                    placeholder="Total seats"
                    style={{ width: "100%" }}
                    size="large"
                    min={0}
                    max={1000}
                    precision={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}
            >
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={
                  formMode === "create" ? (
                    <PlusOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                {formMode === "create" ? "Create Branch" : "Update Branch"}
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Seat Management Modal */}
        <SeatManagementModal
          visible={seatModalVisible}
          branch={selectedBranchForSeats}
          onClose={() => {
            setSeatModalVisible(false);
            setSelectedBranchForSeats(null);
          }}
          onRefresh={() => {
            fetchBranches();
          }}
        />
      </div>
    </div>
  );
};

// Seat Overview Component
const SeatOverview = ({ branches }) => {
  const [seatsData, setSeatsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch seats for all branches
  const fetchSeatsData = async () => {
    setLoading(true);
    try {
      const allSeats = [];
      for (const branch of branches) {
        try {
          const res = await api.get(`/seats/branch/${branch._id}`);
          if (res.data.success) {
            allSeats.push({
              branchId: branch._id,
              branchName: branch.name,
              branchCode: branch.code,
              seats: res.data.data,
              total: res.data.data.length,
              available: res.data.data.filter((s) => s.status === "Available")
                .length,
              booked: res.data.data.filter((s) => s.status === "Booked").length,
              maintenance: res.data.data.filter(
                (s) => s.status === "Maintenance"
              ).length,
              reserved: res.data.data.filter((s) => s.status === "Reserved")
                .length,
            });
          }
        } catch (err) {
          console.error(`Error fetching seats for branch ${branch.name}:`, err);
        }
      }
      setSeatsData(allSeats);
    } catch (err) {
      console.error("Error fetching seats data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branches.length > 0) {
      fetchSeatsData();
    }
  }, [branches]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Progress type="circle" percent={70} />
        <div style={{ marginTop: 20 }}>
          <Text type="secondary">Loading seats data...</Text>
        </div>
      </div>
    );
  }

  if (seatsData.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              No Seats Data Available
            </Title>
            <Text type="secondary">
              Add branches and seats to view seat distribution across locations
            </Text>
          </div>
        }
      >
        <Button type="primary">Add Your First Seat</Button>
      </Empty>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {seatsData.map((data) => (
          <Col xs={24} sm={12} lg={8} key={data.branchId}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BankOutlined style={{ marginRight: 8 }} />
                  {data.branchName}
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {data.branchCode}
                  </Tag>
                </div>
              }
              hoverable
              style={{ borderRadius: 12 }}
              extra={
                <Button type="link" icon={<ArrowRightOutlined />} size="small">
                  Details
                </Button>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Progress
                  percent={
                    data.total > 0
                      ? Math.round((data.available / data.total) * 100)
                      : 0
                  }
                  status={
                    data.available === 0
                      ? "exception"
                      : data.available < data.total * 0.3
                      ? "normal"
                      : "success"
                  }
                />
              </div>
              <Row gutter={8}>
                <Col span={6}>
                  <Statistic
                    title="Total"
                    value={data.total}
                    valueStyle={{ fontSize: 20, color: "#1890ff" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Available"
                    value={data.available}
                    valueStyle={{ fontSize: 20, color: "#52c41a" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Booked"
                    value={data.booked}
                    valueStyle={{ fontSize: 20, color: "#fa541c" }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Others"
                    value={data.maintenance + data.reserved}
                    valueStyle={{ fontSize: 20, color: "#722ed1" }}
                  />
                </Col>
              </Row>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                  }}
                >
                  <Tag color="green">Available: {data.available}</Tag>
                  <Tag color="red">Booked: {data.booked}</Tag>
                  <Tag color="orange">Maintenance: {data.maintenance}</Tag>
                  <Tag color="blue">Reserved: {data.reserved}</Tag>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Collapse ghost style={{ background: "transparent" }}>
        <Panel
          header={
            <div style={{ display: "flex", alignItems: "center" }}>
              <UnorderedListOutlined style={{ marginRight: 8 }} />
              <Text strong>Detailed Seats Breakdown</Text>
            </div>
          }
          key="1"
        >
          <Table
            dataSource={seatsData.flatMap((data) =>
              data.seats.map((seat) => ({
                ...seat,
                branchName: data.branchName,
                key: seat._id,
              }))
            )}
            columns={[
              {
                title: "Seat Number",
                dataIndex: "seatNumber",
                key: "seatNumber",
                render: (text) => (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <NumberOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                    <Text strong>{text}</Text>
                  </div>
                ),
              },
              {
                title: "Branch",
                dataIndex: "branchName",
                key: "branchName",
              },
              {
                title: "Seat Type",
                dataIndex: "seatType",
                key: "seatType",
                render: (type) => (
                  <Tag
                    color={
                      type === "VIP"
                        ? "gold"
                        : type === "Premium"
                        ? "purple"
                        : type === "Couple"
                        ? "magenta"
                        : "blue"
                    }
                  >
                    {type}
                  </Tag>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status) => (
                  <Tag
                    color={
                      status === "Available"
                        ? "green"
                        : status === "Booked"
                        ? "red"
                        : status === "Maintenance"
                        ? "orange"
                        : "blue"
                    }
                  >
                    {status}
                  </Tag>
                ),
              },
              {
                title: "Features",
                dataIndex: "features",
                key: "features",
                render: (features) =>
                  features && features.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {features.slice(0, 2).map((feature, index) => (
                        <Tag key={index} color="cyan" size="small">
                          {feature}
                        </Tag>
                      ))}
                      {features.length > 2 && (
                        <Tag color="default" size="small">
                          +{features.length - 2}
                        </Tag>
                      )}
                    </div>
                  ) : (
                    "-"
                  ),
              },
            ]}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default BranchManagement;
