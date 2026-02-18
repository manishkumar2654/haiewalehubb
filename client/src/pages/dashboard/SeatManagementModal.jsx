// components/admin/SeatManagementModal.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  InputNumber,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  message,
  Popconfirm,
  Tooltip,
  Typography,
  Divider,
  Badge,
  Alert,
  Collapse,
  Descriptions,
  Empty,
} from "antd";
import {
  TeamOutlined,
  CloseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  NumberOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ReloadOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  ControlOutlined,
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const SeatManagementModal = ({ visible, branch, onClose, onRefresh }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seatLoading, setSeatLoading] = useState(false);
  const [form] = Form.useForm();
  const [formMode, setFormMode] = useState("create");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [bulkSeatNumbers, setBulkSeatNumbers] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    maintenance: 0,
    reserved: 0,
  });

  // Seat types and status options
  const seatTypes = ["Regular", "Premium", "VIP", "Couple"];
  const statusOptions = ["Available", "Booked", "Maintenance", "Reserved"];
  const featureOptions = [
    "AC",
    "TV",
    "Massage Chair",
    "Extra Space",
    "Window View",
    "Private",
    "Charging Port",
    "WiFi",
    "Headphone Jack",
    "Adjustable",
    "Wheelchair Access",
  ];

  // Initial seat values
  const initialSeatValues = {
    seatNumber: "",
    seatType: "Regular",
    status: "Available",
    features: [],
    position: {
      row: "",
      column: "",
      section: "",
    },
    notes: "",
    isActive: true,
  };

  // Fetch seats for the branch
  const fetchSeats = async () => {
    if (!branch?._id) return;

    setSeatLoading(true);
    try {
      const res = await api.get(`/seats/branch/${branch._id}`);
      if (res.data.success) {
        setSeats(res.data.data);
        calculateStats(res.data.data);
      }
      
    } catch (err) {
      console.error("Error fetching seats:", err);
      message.error("Failed to load seats");
    } finally {
      setSeatLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (seatsData) => {
    const stats = {
      total: seatsData.length,
      available: seatsData.filter((s) => s.status === "Available").length,
      booked: seatsData.filter((s) => s.status === "Booked").length,
      maintenance: seatsData.filter((s) => s.status === "Maintenance").length,
      reserved: seatsData.filter((s) => s.status === "Reserved").length,
    };
    setStats(stats);
  };

  useEffect(() => {
    if (visible && branch) {
      fetchSeats();
    }
  }, [visible, branch]);

  // Open seat form
  const openSeatForm = (mode = "create", seat = null) => {
    setFormMode(mode);
    setSelectedSeat(seat);

    if (mode === "edit" && seat) {
      form.setFieldsValue({
        ...seat,
        position: seat.position || {},
      });
    } else {
      form.setFieldsValue(initialSeatValues);
    }
  };

  // Handle seat form submit
  const handleSeatSubmit = async (values) => {
    if (!branch?._id) return;

    setLoading(true);
    try {
      const seatData = {
        ...values,
        branch: branch._id,
        branchType: branch.branchType?._id || branch.branchType,
        position: values.position || {},
      };

      if (formMode === "create") {
        const res = await api.post("/seats", seatData);
        if (res.data.success) {
          message.success("Seat created successfully");
          fetchSeats();
          form.resetFields();
          onRefresh?.();
        }
      } else {
        const res = await api.put(`/seats/${selectedSeat._id}`, seatData);
        if (res.data.success) {
          message.success("Seat updated successfully");
          fetchSeats();
          form.resetFields();
          setSelectedSeat(null);
          onRefresh?.();
        }
      }
    } catch (err) {
      console.error("Error saving seat:", err);
      message.error(err.response?.data?.message || "Failed to save seat");
    } finally {
      setLoading(false);
    }
  };

  // Delete seat
  const deleteSeat = async (seatId) => {
    try {
      const res = await api.delete(`/seats/${seatId}`);
      if (res.data.success) {
        message.success("Seat deleted successfully");
        fetchSeats();
        onRefresh?.();
      }
    } catch (err) {
      console.error("Error deleting seat:", err);
      message.error("Failed to delete seat");
    }
  };

  // Update seat status
  const updateSeatStatus = async (seatId, status) => {
    try {
      const res = await api.patch(`/seats/${seatId}/status`, { status });
      if (res.data.success) {
        message.success(`Seat status updated to ${status}`);
        fetchSeats();
        onRefresh?.();
      }
    } catch (err) {
      console.error("Error updating seat status:", err);
      message.error("Failed to update status");
    }
  };

  // Bulk create seats
  const handleBulkCreate = async () => {
    if (!bulkSeatNumbers.trim()) {
      message.warning("Please enter seat numbers");
      return;
    }

    const seatNumbers = bulkSeatNumbers
      .split(/[\n,]/)
      .map((num) => num.trim())
      .filter((num) => num.length > 0);

    if (seatNumbers.length === 0) {
      message.warning("No valid seat numbers found");
      return;
    }

    setLoading(true);
    try {
      const seatData = seatNumbers.map((seatNumber) => ({
        seatNumber,
        branch: branch._id,
        branchType: branch.branchType?._id || branch.branchType,
        seatType: "Regular",
        status: "Available",
        features: [],
      }));

      const res = await api.post("/seats/bulk", {
        branchId: branch._id,
        seats: seatData,
      });

      if (res.data.success) {
        message.success(`Created ${res.data.created} seats`);
        if (res.data.errors?.length > 0) {
          message.warning(
            `${res.data.errors.length} seats failed: ${res.data.errors.join(
              ", "
            )}`
          );
        }
        fetchSeats();
        setBulkModalVisible(false);
        setBulkSeatNumbers("");
        onRefresh?.();
      }
    } catch (err) {
      console.error("Error in bulk create:", err);
      message.error(err.response?.data?.message || "Failed to create seats");
    } finally {
      setLoading(false);
    }
  };

  // Seat columns for table
  const seatColumns = [
    {
      title: "Seat Number",
      dataIndex: "seatNumber",
      key: "seatNumber",
      width: 120,
      sorter: (a, b) => a.seatNumber.localeCompare(b.seatNumber),
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <NumberOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "seatType",
      key: "seatType",
      width: 100,
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
      width: 120,
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: "100%" }}
          size="small"
          onChange={(value) => updateSeatStatus(record._id, value)}
        >
          {statusOptions.map((option) => (
            <Option key={option} value={option}>
              <Tag
                color={
                  option === "Available"
                    ? "green"
                    : option === "Booked"
                    ? "red"
                    : option === "Maintenance"
                    ? "orange"
                    : "blue"
                }
              >
                {option}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      render: (features) =>
        features && features.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
    {
      title: "Last Booked",
      dataIndex: "lastBooked",
      key: "lastBooked",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openSeatForm("edit", record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this seat?"
            onConfirm={() => deleteSeat(record._id)}
            okText="Yes"
            cancelText="No"
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

  // Quick status actions
  const quickStatusActions = [
    { status: "Available", color: "green", icon: <CheckCircleOutlined /> },
    { status: "Booked", color: "red", icon: <CloseCircleOutlined /> },
    { status: "Maintenance", color: "orange", icon: <ToolOutlined /> },
    { status: "Reserved", color: "blue", icon: <CalendarOutlined /> },
  ];

  if (!branch) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <TeamOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Text strong style={{ fontSize: 18 }}>
                Seat Management
              </Text>
              <Badge
                count={branch.code}
                style={{
                  marginLeft: 12,
                  backgroundColor: "#722ed1",
                  fontWeight: "bold",
                }}
              />
            </div>
            <div>
              <Text type="secondary">
                {branch.name} - {branch.address}
              </Text>
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      centered
      maskClosable={false}
      style={{ top: 20 }}
    >
      {/* Branch Info Header */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 8 }}
        bodyStyle={{ padding: "12px 16px" }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <div style={{ display: "flex", alignItems: "center" }}>
              <BankOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              <Text strong>{branch.name}</Text>
              <Divider type="vertical" />
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
                {branch.address}
              </Text>
              <Divider type="vertical" />
              <PhoneOutlined style={{ marginRight: 4 }} />
              <Text>{branch.phone}</Text>
            </div>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSeats}
              loading={seatLoading}
              size="small"
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Total Seats"
              value={stats.total}
              valueStyle={{ color: "#1890ff", fontSize: 28 }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Available"
              value={stats.available}
              valueStyle={{ color: "#52c41a", fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Booked"
              value={stats.booked}
              valueStyle={{ color: "#fa541c", fontSize: 28 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" hoverable>
            <Statistic
              title="Occupancy Rate"
              value={
                stats.total > 0
                  ? Math.round((stats.booked / stats.total) * 100)
                  : 0
              }
              suffix="%"
              valueStyle={{
                color:
                  stats.total > 0 && stats.booked / stats.total > 0.8
                    ? "#fa541c"
                    : "#52c41a",
                fontSize: 28,
              }}
              prefix={<ControlOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card size="small" style={{ marginBottom: 24, borderRadius: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong>Seat Availability Distribution</Text>
        </div>
        <Row gutter={8} align="middle">
          <Col flex="auto">
            <Progress
              percent={
                stats.total > 0
                  ? Math.round((stats.available / stats.total) * 100)
                  : 0
              }
              success={{
                percent:
                  stats.total > 0
                    ? Math.round((stats.booked / stats.total) * 100)
                    : 0,
                strokeColor: "#fa541c",
              }}
              strokeColor="#52c41a"
              trailColor="#f0f0f0"
              size={["100%", 20]}
              strokeLinecap="square"
            />
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.available} available • {stats.booked} booked •{" "}
              {stats.maintenance} maintenance
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card
        size="small"
        title="Quick Actions"
        style={{ marginBottom: 24, borderRadius: 8 }}
        extra={
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            onClick={() => setBulkModalVisible(true)}
            size="small"
          >
            Bulk Create
          </Button>
        }
      >
        <Row gutter={16}>
          {quickStatusActions.map((action) => (
            <Col span={6} key={action.status}>
              <Card
                size="small"
                hoverable
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={() => {
                  // Filter seats by status
                  const filteredSeats = seats.filter(
                    (s) => s.status === action.status
                  );
                  message.info(
                    `${
                      filteredSeats.length
                    } seats are ${action.status.toLowerCase()}`
                  );
                }}
              >
                <div
                  style={{ fontSize: 24, color: action.color, marginBottom: 8 }}
                >
                  {action.icon}
                </div>
                <Text strong>{action.status}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 20 }}>
                    {stats[action.status.toLowerCase()] || 0}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={24}>
        {/* Seat List */}
        <Col span={16}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <UnorderedListOutlined style={{ marginRight: 8 }} />
                  <Text strong>Seats List ({seats.length})</Text>
                </div>
                <div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openSeatForm("create")}
                    size="small"
                  >
                    Add Seat
                  </Button>
                </div>
              </div>
            }
            style={{ borderRadius: 8 }}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              columns={seatColumns}
              dataSource={seats}
              rowKey="_id"
              loading={seatLoading}
              pagination={{ pageSize: 10, size: "small" }}
              size="small"
              scroll={{ y: 400 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <Text type="secondary">
                          No seats found for this branch
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => openSeatForm("create")}
                          >
                            Add First Seat
                          </Button>
                        </div>
                      </div>
                    }
                  />
                ),
              }}
            />
          </Card>
        </Col>

        {/* Seat Form / Details */}
        <Col span={8}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <SettingOutlined style={{ marginRight: 8 }} />
                <Text strong>
                  {formMode === "create" ? "Add New Seat" : "Edit Seat"}
                </Text>
              </div>
            }
            style={{ borderRadius: 8, height: "100%" }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSeatSubmit}
              initialValues={initialSeatValues}
            >
              <Form.Item
                label="Seat Number"
                name="seatNumber"
                rules={[
                  { required: true, message: "Please enter seat number" },
                ]}
              >
                <Input
                  placeholder="e.g., A01, B12"
                  prefix={<NumberOutlined />}
                  size="large"
                />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="Seat Type" name="seatType">
                    <Select size="large">
                      {seatTypes.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Status" name="status">
                    <Select size="large">
                      {statusOptions.map((status) => (
                        <Option key={status} value={status}>
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
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Features" name="features">
                <Select
                  mode="multiple"
                  placeholder="Select features"
                  size="large"
                  allowClear
                >
                  {featureOptions.map((feature) => (
                    <Option key={feature} value={feature}>
                      {feature}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Collapse ghost size="small">
                <Panel header="Position Details" key="1">
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item label="Row" name={["position", "row"]}>
                        <InputNumber
                          placeholder="Row"
                          style={{ width: "100%" }}
                          min={1}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Column" name={["position", "column"]}>
                        <InputNumber
                          placeholder="Column"
                          style={{ width: "100%" }}
                          min={1}
                          max={100}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Section" name={["position", "section"]}>
                        <Input placeholder="Section" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>

              <Form.Item label="Notes" name="notes">
                <TextArea placeholder="Additional notes" rows={2} />
              </Form.Item>

              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Divider />
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                {formMode === "edit" && (
                  <Button
                    onClick={() => {
                      setFormMode("create");
                      form.resetFields();
                      setSelectedSeat(null);
                    }}
                  >
                    New
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={
                    formMode === "create" ? (
                      <PlusOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                >
                  {formMode === "create" ? "Create Seat" : "Update Seat"}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Bulk Create Modal */}
      <Modal
        title="Bulk Create Seats"
        open={bulkModalVisible}
        onCancel={() => {
          setBulkModalVisible(false);
          setBulkSeatNumbers("");
        }}
        onOk={handleBulkCreate}
        confirmLoading={loading}
        width={600}
      >
        <Alert
          message="Instructions"
          description="Enter seat numbers separated by commas or new lines. Each seat will be created with default settings (Regular type, Available status)."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <TextArea
          placeholder="Enter seat numbers, e.g.:&#10;A01, A02, A03&#10;B01, B02, B03&#10;or one per line"
          rows={8}
          value={bulkSeatNumbers}
          onChange={(e) => setBulkSeatNumbers(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            Detected:{" "}
            {
              bulkSeatNumbers
                .split(/[\n,]/)
                .filter((num) => num.trim().length > 0).length
            }{" "}
            seats
          </Text>
        </div>
      </Modal>
    </Modal>
  );
};

export default SeatManagementModal;
