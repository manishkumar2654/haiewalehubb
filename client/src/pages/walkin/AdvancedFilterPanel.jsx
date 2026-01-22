// AdvancedFilterPanel.jsx - Advanced filtering panel for walk-ins
import React from "react";
import {
  Card,
  Button,
  Tag,
  DatePicker,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Divider,
  message,
} from "antd";
import {
  FilterOutlined,
  CalendarOutlined,
  ClearOutlined,
  SearchOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Option } = Select;
const { RangePicker } = DatePicker;

const AdvancedFilterPanel = ({
  branches,
  filteredWalkins,
  allWalkins,
  // Filter states
  dateRange,
  setDateRange,
  advancedStatusFilter,
  setAdvancedStatusFilter,
  advancedBranchFilter,
  setAdvancedBranchFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  customerNameFilter,
  setCustomerNameFilter,
  phoneFilter,
  setPhoneFilter,
  walkinNumberFilter,
  setWalkinNumberFilter,
  // Helper functions
  hasActiveAdvancedFilters,
  clearAdvancedFilters,
}) => {
  const handleExportFiltered = () => {
    try {
      const filteredData = filteredWalkins.map((w) => ({
        "Walk-in #": w.walkinNumber,
        "Customer Name": w.customerName,
        "Phone": w.customerPhone,
        "Email": w.customerEmail || "",
        "Branch": w.branch,
        "Status": w.status,
        "Payment Status": w.paymentStatus,
        "Total Amount": w.totalAmount || 0,
        "Amount Paid": w.amountPaid || 0,
        "Due Amount": w.dueAmount || 0,
        "Discount": w.discount || 0,
        "Payment Method": w.paymentMethod || "cash",
        "Date": new Date(w.createdAt).toLocaleDateString(),
        "Services Count": w.services?.length || 0,
        "Products Count": w.products?.length || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Filtered Walk-ins");
      const fileName = `walkins-filtered-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success("Filtered data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export data");
    }
  };

  return (
    <Card
      className="mb-6"
      title={
        <div className="flex items-center gap-2">
          <FilterOutlined />
          <span>Advanced Filters & Date Range Search</span>
          {hasActiveAdvancedFilters() && (
            <Tag color="blue">Active Filters</Tag>
          )}
        </div>
      }
    >
      <div className="space-y-6">
          {/* Date Range Picker */}
          <div>
            <div className="mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <CalendarOutlined />
                Select Date Range
              </span>
            </div>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              style={{ width: "100%", maxWidth: "400px" }}
              size="large"
              placeholder={["Start Date", "End Date"]}
              allowClear
            />
            {dateRange && dateRange[0] && dateRange[1] && (
              <div className="mt-2 text-xs text-gray-500">
                Filtering walk-ins from{" "}
                {dateRange[0].format
                  ? dateRange[0].format("DD MMM YYYY")
                  : new Date(dateRange[0]).toLocaleDateString()}{" "}
                to{" "}
                {dateRange[1].format
                  ? dateRange[1].format("DD MMM YYYY")
                  : new Date(dateRange[1]).toLocaleDateString()}
              </div>
            )}
          </div>

          <Divider />

          {/* Filter Grid */}
          <Row gutter={[16, 16]}>
            {/* Status Filter */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="mb-2">
                <span className="text-sm font-medium">Status</span>
              </div>
              <Select
                value={advancedStatusFilter}
                onChange={setAdvancedStatusFilter}
                style={{ width: "100%" }}
                size="large"
                placeholder="All Statuses"
              >
                <Option value="all">All Statuses</Option>
                <Option value="draft">Draft</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>

            {/* Branch Filter */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="mb-2">
                <span className="text-sm font-medium">Branch</span>
              </div>
              <Select
                value={advancedBranchFilter}
                onChange={setAdvancedBranchFilter}
                style={{ width: "100%" }}
                size="large"
                placeholder="All Branches"
              >
                <Option value="all">All Branches</Option>
                {branches.map((branch) => (
                  <Option key={branch._id} value={branch.name}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Payment Status Filter */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="mb-2">
                <span className="text-sm font-medium">Payment Status</span>
              </div>
              <Select
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                style={{ width: "100%" }}
                size="large"
                placeholder="All Payment Statuses"
              >
                <Option value="all">All Payment Statuses</Option>
                <Option value="pending">Pending</Option>
                <Option value="partially_paid">Partially Paid</Option>
                <Option value="paid">Paid</Option>
              </Select>
            </Col>

            {/* Amount Range */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="mb-2">
                <span className="text-sm font-medium">Amount Range (₹)</span>
              </div>
              <Space.Compact style={{ width: "100%" }}>
                <InputNumber
                  value={minAmount}
                  onChange={setMinAmount}
                  placeholder="Min"
                  style={{ width: "50%" }}
                  size="large"
                  min={0}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
                <InputNumber
                  value={maxAmount}
                  onChange={setMaxAmount}
                  placeholder="Max"
                  style={{ width: "50%" }}
                  size="large"
                  min={0}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                />
              </Space.Compact>
            </Col>
          </Row>

          <Divider />

          {/* Customer Details Filters */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div className="mb-2">
                <span className="text-sm font-medium">Customer Name</span>
              </div>
              <Input
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
                placeholder="Search by customer name..."
                size="large"
                allowClear
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div className="mb-2">
                <span className="text-sm font-medium">Phone Number</span>
              </div>
              <Input
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Search by phone..."
                size="large"
                allowClear
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div className="mb-2">
                <span className="text-sm font-medium">Walk-in Number</span>
              </div>
              <Input
                value={walkinNumberFilter}
                onChange={(e) => setWalkinNumberFilter(e.target.value)}
                placeholder="Search by walk-in #..."
                size="large"
                allowClear
              />
            </Col>
          </Row>

          <Divider />

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing <strong>{filteredWalkins.length}</strong> of{" "}
              <strong>{allWalkins.length}</strong> walk-ins
              {hasActiveAdvancedFilters() && (
                <Tag color="blue" className="ml-2">
                  {filteredWalkins.length} filtered results
                </Tag>
              )}
            </div>
            <Space>
              <Button
                icon={<ClearOutlined />}
                onClick={clearAdvancedFilters}
                disabled={!hasActiveAdvancedFilters()}
              >
                Clear All Filters
              </Button>
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExportFiltered}
                disabled={filteredWalkins.length === 0}
              >
                Export Filtered Results
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedFilterPanel;
