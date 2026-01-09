/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Edit2, Download, QrCode, Search, Plus } from "lucide-react";
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
import UpdateWalkinModal from "./UpdateWalkinModal"; // NEW IMPORT

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
  const [updateModalVisible, setUpdateModalVisible] = useState(false); // NEW STATE
  const [selectedWalkin, setSelectedWalkin] = useState(null);

  // Filter states (unchanged)
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Handle Download PDF (unchanged)
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

  // Handle Show QR (unchanged)
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

  // Export to Excel (unchanged)
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

  // Filter walkins (unchanged)
  const filteredWalkins = walkins.filter((walkin) => {
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

  // Columns (WITH NEW "EDIT/UPDATE" BUTTON ADDED)
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
        </div>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Services",
      render: (_, record) => (
        <div>
          {record.services?.slice(0, 2).map((s, i) => (
            <Tag key={i} color="blue" className="mb-1">
              {s.service?.name}
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
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <div className="font-bold text-green-600">
          ₹{amount?.toFixed(2) || "0.00"}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 300,
      render: (_, record) => (
        <Space size="small">
          {/* View Button */}
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedWalkin(record);
                // You can add view modal here if needed
                message.info("View feature - To be implemented");
              }}
            />
          </Tooltip>

          {/* NEW: Update/Edit Walkin Button */}
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
      {/* Filters (unchanged) */}
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

      {/* Stats Row (unchanged) */}
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
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Revenue"
              value={filteredWalkins.reduce(
                (sum, w) => sum + (w.totalAmount || 0),
                0
              )}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Walkins Table (unchanged) */}
      <Table
        columns={columns}
        dataSource={filteredWalkins}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* QR Modal (unchanged) */}
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

      {/* NEW: Update Walkin Modal */}
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
