import React, { useState, useMemo } from "react";
import {
  Edit2,
  Download,
  QrCode,
  Search,
  Plus,
  Calculator,
} from "lucide-react";
import {
  Input,
  Select,
  Table,
  Tag,
  Card,
  message,
  Modal,
  Button,
  Row,
  Col,
  Statistic,
  Space,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  ShoppingCartOutlined,
  FilePdfOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  ExportOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../../services/api";
import QRModal from "./QRModal";
import UpdateWalkinModal from "./UpdateWalkinModal";
import CalculatePriceCell from "./CalculatePriceCell";

const { Option } = Select;

const WalkinList = ({
  walkins,
  fetchWalkins,
  branches,
  services,
  categories,
  products,
}) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedWalkin, setSelectedWalkin] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Handle Download PDF
  const handleDownloadPDF = async (walkinId) => {
    try {
      const res = await api.get(`/walkins/${walkinId}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `walkin-${walkinId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("PDF downloaded successfully!");
    } catch (error) {
      message.error("Failed to download PDF");
    }
  };

  // Handle Show QR
  const handleShowQR = (walkin) => {
    const qrData = {
      walkinId: walkin._id,
      walkinNumber: walkin.walkinNumber,
      customerName: walkin.customerName,
      totalAmount: walkin.totalAmount,
      timestamp: walkin.createdAt || new Date().toISOString(),
    };
    setSelectedQrData(qrData);
    setQrModalVisible(true);
  };

  // View Details Modal
  const showWalkinDetails = (walkin) => {
    Modal.info({
      title: (
        <div className="flex items-center">
          <EyeOutlined className="mr-2 text-blue-600" />
          <span>Walk-in Details: {walkin.walkinNumber}</span>
        </div>
      ),
      width: 800,
      icon: null,
      okButtonProps: { style: { display: "none" } }, // Hide default OK button
      content: (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <Card size="small" title="Customer Information">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Customer Name</div>
                  <div className="font-semibold text-lg">
                    {walkin.customerName}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <div className="font-semibold text-lg">
                    {walkin.customerPhone}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Branch</div>
                  <div className="font-semibold">{walkin.branch}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Status</div>
                  <Tag
                    color={
                      walkin.status === "completed"
                        ? "green"
                        : walkin.status === "cancelled"
                        ? "red"
                        : walkin.status === "confirmed"
                        ? "blue"
                        : walkin.status === "in_progress"
                        ? "orange"
                        : "gray"
                    }
                    className="font-semibold"
                  >
                    {walkin.status?.toUpperCase()}
                  </Tag>
                </div>
              </Col>
            </Row>
            {walkin.customerEmail && (
              <div className="mb-3">
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-semibold">{walkin.customerEmail}</div>
              </div>
            )}
            {walkin.customerAddress && (
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-semibold">{walkin.customerAddress}</div>
              </div>
            )}
          </Card>

          {/* Services Section */}
          {walkin.services && walkin.services.length > 0 && (
            <Card size="small" title={`Services (${walkin.services.length})`}>
              <div className="space-y-2">
                {walkin.services.map((service, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {service.service?.name || "Service"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {service.category?.name || "Category"} •{" "}
                        {service.duration || 0} mins
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ₹{service.price?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {service.staff?.name
                          ? `Staff: ${service.staff.name}`
                          : "No staff assigned"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Products Section */}
          {walkin.products && walkin.products.length > 0 && (
            <Card size="small" title={`Products (${walkin.products.length})`}>
              <div className="space-y-2">
                {walkin.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {product.product?.name || "Product"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Quantity: {product.quantity || 1} • ₹
                        {product.price?.toFixed(2) || "0.00"} each
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        ₹{product.total?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {product.stockDeducted
                          ? "✓ Stock deducted"
                          : "Stock pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Payment Summary */}
          <Card
            size="small"
            title="Payment Summary"
            className="bg-blue-50 border-blue-200"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ₹{walkin.subtotal?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-semibold text-red-600">
                  -₹{walkin.discount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Amount:</span>
                <span className="font-bold text-green-600 text-lg">
                  ₹{walkin.totalAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-semibold">
                  ₹{walkin.amountPaid?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Due Amount:</span>
                <span
                  className={`font-bold text-lg ${
                    walkin.dueAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{walkin.dueAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Tag
                  color={
                    walkin.paymentStatus === "paid"
                      ? "green"
                      : walkin.paymentStatus === "partially_paid"
                      ? "orange"
                      : "red"
                  }
                  className="font-semibold"
                >
                  {walkin.paymentStatus?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-medium">Invoice #</div>
              <div>{walkin.invoiceNumber || "N/A"}</div>
            </div>
            <div>
              <div className="font-medium">Created Date</div>
              <div>{new Date(walkin.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      ),
      footer: (
        <div className="flex justify-between">
          <div>
            <Button
              onClick={() => handleShowQR(walkin)}
              icon={<QrcodeOutlined />}
            >
              View QR Code
            </Button>
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => handleDownloadPDF(walkin._id)}
              icon={<Download />}
            >
              Download PDF
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setSelectedWalkin(walkin);
                setUpdateModalVisible(true);
                Modal.destroyAll();
              }}
              icon={<Edit2 className="w-4 h-4" />}
            >
              Edit Walk-in
            </Button>
          </div>
        </div>
      ),
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = walkins.map((walkin) => ({
      "Walk-in #": walkin.walkinNumber,
      "Customer Name": walkin.customerName,
      Phone: walkin.customerPhone,
      Email: walkin.customerEmail,
      Branch: walkin.branch,
      Services:
        walkin.services?.map((s) => s.service?.name).join(", ") || "None",
      Products:
        walkin.products
          ?.map((p) => `${p.product?.name} x${p.quantity}`)
          .join(", ") || "None",
      Subtotal: walkin.subtotal,
      Tax: walkin.tax,
      Discount: walkin.discount,
      "Total Amount": walkin.totalAmount,
      "Amount Paid": walkin.amountPaid,
      "Due Amount": walkin.dueAmount,
      "Payment Status": walkin.paymentStatus,
      "Walk-in Status": walkin.status,
      "Created Date": new Date(walkin.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Walkins");
    XLSX.writeFile(
      wb,
      `walkins_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    message.success("Walkins exported to Excel successfully!");
  };

  // Filter walkins
  const filteredWalkins = useMemo(() => {
    return walkins.filter((walkin) => {
      const matchesSearch =
        searchText === "" ||
        walkin.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        walkin.walkinNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        walkin.customerPhone.includes(searchText);

      const matchesStatus =
        statusFilter === "all" || walkin.status === statusFilter;
      const matchesBranch =
        branchFilter === "all" || walkin.branch === branchFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const today = new Date().toDateString();
        matchesDate = new Date(walkin.createdAt).toDateString() === today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(walkin.createdAt) >= weekAgo;
      }

      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [walkins, searchText, statusFilter, branchFilter, dateFilter]);

  // Columns
  const columns = [
    {
      title: "Walk-in #",
      dataIndex: "walkinNumber",
      key: "walkinNumber",
      sorter: (a, b) => a.walkinNumber.localeCompare(b.walkinNumber),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.customerName}</div>
          <div className="text-sm text-gray-500">{record.customerPhone}</div>
          <div className="text-xs text-gray-400">{record.branch}</div>
        </div>
      ),
    },
    {
      title: "Services",
      render: (_, record) => (
        <div>
          {record.services?.slice(0, 2).map((s, i) => (
            <Tag key={i} color="blue" className="mb-1">
              {s.service?.name?.slice(0, 20) || "Service"}
            </Tag>
          ))}
          {record.services?.length > 2 && (
            <Tooltip title={`${record.services.length} services`}>
              <Tag color="cyan">+{record.services.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          draft: { color: "default", text: "Draft" },
          confirmed: { color: "blue", text: "Confirmed" },
          in_progress: { color: "orange", text: "In Progress" },
          completed: { color: "green", text: "Completed" },
          cancelled: { color: "red", text: "Cancelled" },
        };
        const config = statusConfig[status] || { color: "gray", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Calculated Price",
      key: "calculatedPrice",
      width: 200,
      render: (_, record) => <CalculatePriceCell walkin={record} />,
    },

    {
      title: "Actions",
      key: "actions",
      width: 300,
      render: (_, record) => (
        <Space size="small">
          {/* View Details Button - NOW WORKING */}
          <Tooltip title="View Details">
            <Button
              size="small"
              type="default"
              icon={<EyeOutlined />}
              onClick={() => showWalkinDetails(record)}
            />
          </Tooltip>

          {/* Edit Button */}
          <Tooltip title="Edit Walk-in">
            <Button
              size="small"
              type="primary"
              icon={<Edit2 className="w-3 h-3" />}
              onClick={() => {
                setSelectedWalkin(record);
                setUpdateModalVisible(true);
              }}
            />
          </Tooltip>

          {/* Download PDF Button */}
          <Tooltip title="Download PDF">
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleDownloadPDF(record._id)}
            />
          </Tooltip>

          {/* QR Code Button */}
          <Tooltip title="Show QR Code">
            <Button
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleShowQR(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name, walkin #, phone..."
          prefix={<FilterOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />

        <Select
          placeholder="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All Status</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>

        <Select
          placeholder="Branch"
          value={branchFilter}
          onChange={setBranchFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All Branches</Option>
          {branches.map((branch) => (
            <Option key={branch._id} value={branch.name}>
              {branch.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Date"
          value={dateFilter}
          onChange={setDateFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All Dates</Option>
          <Option value="today">Today</Option>
          <Option value="week">This Week</Option>
        </Select>

        <Button icon={<ReloadOutlined />} onClick={fetchWalkins}>
          Refresh
        </Button>

        <Button
          type="primary"
          icon={<ExportOutlined />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Walk-ins"
              value={filteredWalkins.length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="In Progress"
              value={
                filteredWalkins.filter((w) => w.status === "in_progress").length
              }
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Completed"
              value={
                filteredWalkins.filter((w) => w.status === "completed").length
              }
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Walkins Table */}
      <Table
        columns={columns}
        dataSource={filteredWalkins}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* QR Modal */}
      {selectedQrData && (
        <QRModal
          visible={qrModalVisible}
          qrData={selectedQrData}
          onClose={() => {
            setQrModalVisible(false);
            setSelectedQrData(null);
          }}
          onDownloadPDF={() => handleDownloadPDF(selectedQrData.walkinId)}
        />
      )}

      {/* Update Walkin Modal */}
      {selectedWalkin && (
        <UpdateWalkinModal
          visible={updateModalVisible}
          onClose={() => {
            setUpdateModalVisible(false);
            setSelectedWalkin(null);
          }}
          walkin={selectedWalkin}
          branches={branches}
          services={services}
          categories={categories}
          products={products}
          fetchWalkins={fetchWalkins}
        />
      )}
    </>
  );
};

export default WalkinList;
