// UpdateWalkinModal.jsx - SIMPLIFIED VERSION
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Tabs,
  Form,
  Input,
  Select,
  Table,
  Tag,
  Card,
  Space,
  InputNumber,
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  ShoppingOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import UpdateServiceSelector from "./UpdateServiceSelector";
import UpdateProductSelector from "./UpdateProductSelector";

const { Option } = Select;
const { TabPane } = Tabs;

const UpdateWalkinModal = ({
  visible,
  onClose,
  walkin,
  branches,
  services,
  categories,
  products,
  fetchWalkins,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [activeTab, setActiveTab] = useState("1");

  // Simple state management
  const [newServices, setNewServices] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [servicesToRemove, setServicesToRemove] = useState([]);
  const [productsToRemove, setProductsToRemove] = useState([]);

  // Initialize
  useEffect(() => {
    if (walkin) {
      form.setFieldsValue({
        customerName: walkin.customerName,
        customerPhone: walkin.customerPhone,
        customerEmail: walkin.customerEmail || "",
        customerAddress: walkin.customerAddress || "",
        notes: walkin.notes || "",
        branch: walkin.branch,
        discount: walkin.discount || 0,
        paymentMethod: walkin.paymentMethod || "cash",
        amountPaid: walkin.amountPaid || 0,
        status: walkin.status || "draft",
      });

      setNewServices([]);
      setNewProducts([]);
      setServicesToRemove([]);
      setProductsToRemove([]);
      fetchBranchStaff(walkin.branch);
    }
  }, [walkin, form]);

  const fetchBranchStaff = async (branchName) => {
    try {
      const staffRes = await api.get(
        `/walkins/staff/branch?branch=${branchName}`
      );
      setAvailableStaff(staffRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch branch staff:", error);
      setAvailableStaff([]);
    }
  };

  // DIRECT HANDLERS - NO COMPLEX LOGIC
  const handleServiceSelect = (serviceData) => {
    console.log("✅ Service selected:", serviceData);
    setNewServices((prev) => [...prev, serviceData]);
    message.success(`Added ${serviceData.name} - ₹${serviceData.price}`);
  };

  const handleProductSelect = (productData) => {
    console.log("✅ Product selected:", productData);
    setNewProducts((prev) => [...prev, productData]);
    message.success(`Added ${productData.name} x${productData.quantity}`);
  };

  // Simple remove functions
  const removeNewService = (index) => {
    setNewServices((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingService = (serviceId) => {
    setServicesToRemove((prev) => [...prev, serviceId]);
  };

  const removeNewProduct = (index) => {
    setNewProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingProduct = (productId) => {
    setProductsToRemove((prev) => [...prev, productId]);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!walkin)
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
        amountPaid: 0,
        dueAmount: 0,
      };

    const existingServices = walkin.services || [];
    const existingProducts = walkin.products || [];

    const activeServices = existingServices.filter(
      (s) => !servicesToRemove.includes(s._id?.toString())
    );

    const activeProducts = existingProducts.filter(
      (p) => !productsToRemove.includes(p._id?.toString())
    );

    const existingServicesTotal = activeServices.reduce(
      (sum, s) => sum + (s.price || 0),
      0
    );
    const newServicesTotal = newServices.reduce(
      (sum, s) => sum + (s.price || 0),
      0
    );

    const existingProductsTotal = activeProducts.reduce(
      (sum, p) => sum + (p.total || 0),
      0
    );
    const newProductsTotal = newProducts.reduce(
      (sum, p) => sum + (p.total || 0),
      0
    );

    const subtotal =
      existingServicesTotal +
      newServicesTotal +
      existingProductsTotal +
      newProductsTotal;
    const discount = form.getFieldValue("discount") || 0;
    const total = subtotal - discount;
    const amountPaid = form.getFieldValue("amountPaid") || 0;
    const dueAmount = total - amountPaid;

    return { subtotal, discount, total, amountPaid, dueAmount };
  };

  // Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const totals = calculateTotals();

      // Simple payload
      const payload = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        customerAddress: values.customerAddress,
        notes: values.notes,
        branch: values.branch,
        addServices: newServices,
        removeServiceIds: servicesToRemove,
        addProducts: newProducts,
        removeProductIds: productsToRemove,
        discount: values.discount || 0,
        paymentMethod: values.paymentMethod,
        amountPaid: values.amountPaid || 0,
        status: values.status,
      };

      console.log("🚀 Sending payload:", payload);

      const response = await api.put(
        `/walkins/${walkin._id}/complete-update`,
        payload
      );

      if (response.data.success) {
        message.success("Walkin updated successfully!");
        fetchWalkins();
        onClose();
      } else {
        message.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      message.error(error.response?.data?.message || "Failed to update walkin");
    } finally {
      setLoading(false);
    }
  };

  if (!walkin) return null;

  const totals = calculateTotals();
  const existingServices = walkin.services || [];
  const existingProducts = walkin.products || [];

  const displayServices = [
    ...existingServices.filter(
      (s) => !servicesToRemove.includes(s._id?.toString())
    ),
    ...newServices,
  ];

  const displayProducts = [
    ...existingProducts.filter(
      (p) => !productsToRemove.includes(p._id?.toString())
    ),
    ...newProducts,
  ];

  return (
    <Modal
      title={
        <div className="flex items-center">
          <EditOutlined className="mr-2" />
          Update Walk-in #{walkin.walkinNumber}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Update Walk-in
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        {/* Tab 1: Basic Info */}
        <TabPane tab="Basic Info" key="1">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerName"
                  label="Customer Name"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter customer name"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="customerPhone"
                  label="Phone Number"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="customerEmail" label="Email">
                  <Input prefix={<MailOutlined />} placeholder="Enter email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="branch" label="Branch">
                  <Select placeholder="Select branch">
                    {branches.map((branch) => (
                      <Option key={branch._id} value={branch.name}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="customerAddress" label="Address">
              <Input.TextArea placeholder="Enter address" rows={2} />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea placeholder="Additional notes" rows={2} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="discount" label="Discount (₹)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="paymentMethod" label="Payment Method">
                  <Select>
                    <Option value="cash">Cash</Option>
                    <Option value="card">Card</Option>
                    <Option value="upi">UPI</Option>
                    <Option value="credit">Credit</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="amountPaid" label="Amount Paid (₹)">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="status" label="Status">
              <Select>
                <Option value="draft">Draft</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </Form>
        </TabPane>

        {/* Tab 2: Services */}
        <TabPane tab="Services" key="2">
          <div className="mb-4">
            <Card size="small" title="Add New Services" className="mb-4">
              <UpdateServiceSelector
                services={services}
                categories={categories}
                availableStaff={availableStaff}
                onServiceSelect={handleServiceSelect}
              />
            </Card>

            <Card size="small" title="Current Services">
              <Table
                dataSource={displayServices}
                rowKey={(record, index) => record._id || `new-${index}`}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Service",
                    dataIndex: "name",
                    key: "name",
                    render: (name, record) => (
                      <div>
                        <div className="font-medium">{name}</div>
                        {record.isNew ? (
                          <Tag color="green" size="small">
                            New
                          </Tag>
                        ) : record._id &&
                          servicesToRemove.includes(record._id) ? (
                          <Tag color="red" size="small">
                            Removed
                          </Tag>
                        ) : null}
                      </div>
                    ),
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
                    width: 100,
                    render: (_, record, index) => (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          if (record.isNew) {
                            removeNewService(
                              index -
                                existingServices.length +
                                servicesToRemove.length
                            );
                          } else {
                            removeExistingService(record._id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </TabPane>

        {/* Tab 3: Products */}
        <TabPane tab="Products" key="3">
          <div className="mb-4">
            <Card size="small" title="Add New Products" className="mb-4">
              <UpdateProductSelector
                products={products}
                onProductSelect={handleProductSelect}
              />
            </Card>

            <Card size="small" title="Current Products">
              <Table
                dataSource={displayProducts}
                rowKey={(record, index) => record._id || `new-${index}`}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Product",
                    dataIndex: "name",
                    key: "name",
                    render: (name, record) => (
                      <div>
                        <div className="font-medium">{name}</div>
                        {record.isNew ? (
                          <Tag color="green" size="small">
                            New
                          </Tag>
                        ) : record._id &&
                          productsToRemove.includes(record._id) ? (
                          <Tag color="red" size="small">
                            Removed
                          </Tag>
                        ) : null}
                      </div>
                    ),
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                  },
                  {
                    title: "Price",
                    dataIndex: "price",
                    key: "price",
                    render: (price) => `₹${price || 0}`,
                  },
                  {
                    title: "Total",
                    dataIndex: "total",
                    key: "total",
                    render: (total) => `₹${total || 0}`,
                  },
                  {
                    title: "Action",
                    key: "action",
                    width: 100,
                    render: (_, record, index) => (
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          if (record.isNew) {
                            removeNewProduct(
                              index -
                                existingProducts.length +
                                productsToRemove.length
                            );
                          } else {
                            removeExistingProduct(record._id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        </TabPane>

        {/* Tab 4: Summary */}
        <TabPane tab="Summary" key="4">
          <Card>
            <Row gutter={16} className="mb-6">
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Services"
                    value={displayServices.length}
                    prefix={<ScissorOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Products"
                    value={displayProducts.length}
                    prefix={<ShoppingOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Subtotal"
                    value={totals.subtotal}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Amount"
                    value={totals.total}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Discount:</span>
                <span className="text-red-600 font-bold">
                  -₹{totals.discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-green-600 font-bold text-lg">
                  ₹{totals.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold">Amount Paid:</span>
                <span className="font-bold">
                  ₹{totals.amountPaid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Due Amount:</span>
                <span
                  className={`font-bold ${
                    totals.dueAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{totals.dueAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Changes Summary:
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {newServices.length > 0 && (
                  <li>Add {newServices.length} new service(s)</li>
                )}
                {servicesToRemove.length > 0 && (
                  <li>Remove {servicesToRemove.length} service(s)</li>
                )}
                {newProducts.length > 0 && (
                  <li>Add {newProducts.length} new product(s)</li>
                )}
                {productsToRemove.length > 0 && (
                  <li>Remove {productsToRemove.length} product(s)</li>
                )}
              </ul>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UpdateWalkinModal;
