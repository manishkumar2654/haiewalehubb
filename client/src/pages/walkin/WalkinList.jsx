// WalkinList.jsx (FULL + DETAILS RESTORED + DROPDOWN OVERFLOW FIX)
// ✅ Full Walk-in Details (Services/Products/Payment Summary) back
// ✅ QuickActions full menu items back
// ✅ Select dropdown + More menu dropdown stay inside viewport on mobile
// ✅ 390px: no horizontal overflow in filters section

import React, { useMemo, useState } from "react";
import {
  Download,
  Calculator,
  Scissors,
  Users,
  ShoppingBag,
  X,
  DollarSign,
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
  InputNumber,
  Drawer,
  Dropdown,
  Grid,
  List,
  Divider,
} from "antd";
import {
  EyeOutlined,
  FilePdfOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  ExportOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import api from "../../services/api";
import QRModal from "./QRModal";
import InlineServiceSelector from "./InlineServiceSelector";
import InlineEmployeeSelector from "./InlineEmployeeSelector";
import InlineProductSelector from "./InlineProductSelector";
import AdvancedFilterPanel from "./AdvancedFilterPanel";

const { Option } = Select;
const { useBreakpoint } = Grid;

const WalkinList = ({
  walkins,
  fetchWalkins,
  branches,
  services,
  categories,
  products,
}) => {
  const screens = useBreakpoint();
  const isMobile = screens.md === false;

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrData, setSelectedQrData] = useState(null);

  // Basic filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Advanced filters (Drawer)
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [advancedStatusFilter, setAdvancedStatusFilter] = useState("all");
  const [advancedBranchFilter, setAdvancedBranchFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [customerNameFilter, setCustomerNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [walkinNumberFilter, setWalkinNumberFilter] = useState("");

  // Modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const [currentWalkin, setCurrentWalkin] = useState(null);

  // Status/payment states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discountType, setDiscountType] = useState("amount");
  const [discountValue, setDiscountValue] = useState(0);

  // ===== Helpers =====
  const clearBasicFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setBranchFilter("all");
    setDateFilter("all");
  };

  const clearAdvancedFilters = () => {
    setDateRange(null);
    setAdvancedStatusFilter("all");
    setAdvancedBranchFilter("all");
    setPaymentStatusFilter("all");
    setMinAmount(null);
    setMaxAmount(null);
    setCustomerNameFilter("");
    setPhoneFilter("");
    setWalkinNumberFilter("");
    message.info("Advanced filters cleared");
  };

  const hasActiveAdvancedFilters = () => {
    return (
      (dateRange && dateRange[0] && dateRange[1]) ||
      advancedStatusFilter !== "all" ||
      advancedBranchFilter !== "all" ||
      paymentStatusFilter !== "all" ||
      minAmount !== null ||
      maxAmount !== null ||
      customerNameFilter !== "" ||
      phoneFilter !== "" ||
      walkinNumberFilter !== ""
    );
  };

  const getStatusTag = (status) => {
    const map = {
      draft: { color: "default", text: "Draft" },
      confirmed: { color: "blue", text: "Confirmed" },
      in_progress: { color: "orange", text: "In Progress" },
      completed: { color: "green", text: "Completed" },
      cancelled: { color: "red", text: "Cancelled" },
    };
    return map[status] || { color: "default", text: status || "N/A" };
  };

  const getPaymentTag = (paymentStatus) => {
    return {
      color:
        paymentStatus === "paid"
          ? "green"
          : paymentStatus === "partially_paid"
          ? "orange"
          : "red",
      text: (paymentStatus || "unpaid").toUpperCase(),
    };
  };

  // ✅ Seat helper
  const getSeatLabel = (walkin) => {
    if (!walkin) return "N/A";
    if (walkin.seatNumber) return String(walkin.seatNumber);
    if (walkin.seatName) return String(walkin.seatName);
    if (walkin.seatLabel) return String(walkin.seatLabel);

    if (walkin.seat) {
      if (typeof walkin.seat === "string") return walkin.seat;
      return (
        walkin.seat.seatNumber ||
        walkin.seat.number ||
        walkin.seat.name ||
        walkin.seat.label ||
        "N/A"
      );
    }

    const seatsArr =
      walkin.selectedSeats ||
      walkin.seats ||
      walkin.seatBookings ||
      walkin.seatBooking ||
      [];

    if (Array.isArray(seatsArr) && seatsArr.length) {
      const labels = seatsArr
        .map((s) => {
          if (!s) return null;
          if (typeof s === "string") return s;
          return s.seatNumber || s.number || s.name || s.label || null;
        })
        .filter(Boolean);

      return labels.length ? labels.join(", ") : "N/A";
    }

    return "N/A";
  };

  // ===== Actions =====
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
    } catch {
      message.error("Failed to download PDF");
    }
  };

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

  // ✅ FULL DETAILS RESTORED
  const showWalkinDetails = (walkin) => {
    const modal = Modal.info({
      title: (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <EyeOutlined className="mr-2 text-blue-600" />
            <span>Walk-in Details: {walkin.walkinNumber}</span>
          </div>
          <Button
            type="text"
            icon={<X className="w-4 h-4 text-gray-500 hover:text-gray-700" />}
            onClick={() => modal.destroy()}
            className="!p-1 !h-auto !w-auto hover:bg-gray-100 rounded"
            style={{ marginLeft: "auto" }}
          />
        </div>
      ),

      width: isMobile ? "92vw" : 820,
      centered: isMobile ? true : undefined,
      style: isMobile ? { padding: 0 } : undefined,
      wrapClassName: isMobile
        ? "premium-modal mobile-center-modal"
        : "premium-modal",

      maskClosable: false,
      keyboard: false,

      icon: null,
      closable: true,
      okButtonProps: { style: { display: "none" } },
      content: (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <Card size="small" title="Customer Information">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Customer Name</div>
                  <div className="font-semibold text-lg">
                    {walkin.customerName}
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <div className="font-semibold text-lg">
                    {walkin.customerPhone}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Branch</div>
                  <div className="font-semibold">{walkin.branch}</div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Seat</div>
                  <div className="font-semibold">{getSeatLabel(walkin)}</div>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Status</div>
                  <Tag
                    color={getStatusTag(walkin.status).color}
                    className="font-semibold"
                  >
                    {(walkin.status || "draft").toUpperCase()}
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

          {walkin.services?.length > 0 && (
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

          {walkin.products?.length > 0 && (
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
                    (walkin.dueAmount || 0) > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{walkin.dueAmount?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Tag
                  color={getPaymentTag(walkin.paymentStatus).color}
                  className="font-semibold"
                >
                  {(walkin.paymentStatus || "unpaid").toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>
        </div>
      ),
      footer: (
        <div className="flex justify-between">
          <Button onClick={() => handleShowQR(walkin)} icon={<QrcodeOutlined />}>
            View QR
          </Button>
          <Button
            onClick={() => handleDownloadPDF(walkin._id)}
            icon={<Download />}
          >
            PDF
          </Button>
        </div>
      ),
    });
  };

  const exportToExcel = () => {
    const exportData = filteredWalkins.map((walkin) => ({
      "Walk-in #": walkin.walkinNumber,
      "Customer Name": walkin.customerName,
      Phone: walkin.customerPhone,
      Email: walkin.customerEmail,
      Branch: walkin.branch,
      Seat: getSeatLabel(walkin),
      Services: walkin.services?.map((s) => s.service?.name).join(", ") || "None",
      Products:
        walkin.products
          ?.map((p) => `${p.product?.name} x${p.quantity}`)
          .join(", ") || "None",
      Subtotal: walkin.subtotal,
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

  // ===== Save handlers =====
  const handleServicesSelected = async (walkinId, selectedServices) => {
    try {
      const servicesPayload = selectedServices.map((s) => ({
        serviceId: String(s.serviceId),
        pricingId: String(s.pricingId),
        staffId: s.staffId ? String(s.staffId) : null,
        price: Number(s.price) || 0,
        duration: Number(s.duration) || 30,
      }));

      await api.put(`/walkins/${walkinId}/replace-services`, {
        services: servicesPayload,
      });

      message.success("Services saved!");
      await fetchWalkins();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save services");
    }
  };

  const handleEmployeesSelected = async (walkinId, selectedEmployees) => {
    try {
      const walkinResponse = await api.get(`/walkins/${walkinId}`);
      const current = walkinResponse.data?.data || walkinResponse.data;
      if (!current) return message.error("Walk-in not found");

      const existingServices = current.services || [];

      const servicesWithEmployees = existingServices.map((service, index) => ({
        serviceId: service.service?._id || service.service,
        pricingId: service.pricing?._id || service.pricing,
        staffId:
          selectedEmployees[index]?._id ||
          service.staff?._id ||
          service.staff ||
          null,
        price: service.price || 0,
        duration: service.duration || 30,
      }));

      if (servicesWithEmployees.length > 0) {
        await api.put(`/walkins/${walkinId}`, {
          services: servicesWithEmployees,
        });
      }

      message.success("Employees assigned successfully!");
      await fetchWalkins();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to assign employees");
    }
  };

  const handleProductsSelected = async (walkinId, selectedProducts) => {
    try {
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: Number(p.quantity) || 1,
        price: Number(p.price) || 0,
      }));

      await api.put(`/walkins/${walkinId}/replace-products`, {
        products: productsPayload,
      });

      message.success("Products saved!");
      await fetchWalkins();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to save products");
    }
  };

  // Status
  const handleUpdateStatus = (walkin) => {
    setCurrentWalkin(walkin);
    setSelectedStatus(walkin.status || "draft");
    setStatusModalVisible(true);
  };

  const handleSaveStatus = async () => {
    if (!currentWalkin) return;

    const currentStatus = currentWalkin.status || "draft";
    if (selectedStatus === currentStatus) {
      message.info("Status unchanged");
      setStatusModalVisible(false);
      return;
    }

    try {
      const res = await api.patch(`/walkins/${currentWalkin._id}/status-only`, {
        status: selectedStatus,
      });

      if (res.data.success) {
        message.success(`Status updated to ${selectedStatus.toUpperCase()}`);
        setStatusModalVisible(false);
        setCurrentWalkin(null);
        setSelectedStatus("");
        await fetchWalkins();
      } else {
        message.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Payment
  const handleUpdatePayment = (walkin) => {
    setCurrentWalkin(walkin);
    setPaymentAmount(walkin.amountPaid || 0);
    setPaymentMethod(walkin.paymentMethod || "cash");
    setDiscountValue(walkin.discount || 0);

    if (walkin.discount && walkin.subtotal) {
      const percentage = (walkin.discount / walkin.subtotal) * 100;
      if (
        percentage > 0 &&
        percentage <= 100 &&
        Math.abs(percentage - Math.round(percentage)) < 0.01
      ) {
        setDiscountType("percentage");
      } else setDiscountType("amount");
    } else setDiscountType("amount");

    setPaymentModalVisible(true);
  };

  const calculateDiscountAmount = () => {
    if (!currentWalkin) return 0;
    const subtotal = currentWalkin.subtotal || currentWalkin.totalAmount || 0;
    if (discountType === "percentage") {
      return (subtotal * (discountValue || 0)) / 100;
    }
    return discountValue || 0;
  };

  const calculateTotalAfterDiscount = () => {
    if (!currentWalkin) return 0;
    const subtotal = currentWalkin.subtotal || currentWalkin.totalAmount || 0;
    const discount = calculateDiscountAmount();
    return Math.max(subtotal - discount, 0);
  };

  const handleSavePayment = async () => {
    if (!currentWalkin) return;

    try {
      const discountAmount = calculateDiscountAmount();

      const res = await api.patch(`/walkins/${currentWalkin._id}/payment`, {
        amountPaid: parseFloat(paymentAmount) || 0,
        paymentMethod,
        discount: discountAmount,
      });

      if (res.data.success) {
        message.success("Payment updated successfully");
        setPaymentModalVisible(false);
        setCurrentWalkin(null);
        setPaymentAmount(0);
        setPaymentMethod("cash");
        setDiscountValue(0);
        setDiscountType("amount");
        await fetchWalkins();
      } else {
        message.error(res.data.message || "Failed to update payment");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update payment");
    }
  };

  // Calculate price (RESTORED)
  const handleCalculatePrice = async (walkin) => {
    try {
      const response = await api.get(`/walkins/${walkin._id}`);
      const latestWalkin = response.data?.data || response.data;
      if (!latestWalkin) return message.error("Failed to fetch walk-in data");

      const servicesTotal = (latestWalkin.services || []).reduce((sum, s) => {
        const price = s.price || s.service?.pricing?.[0]?.price || 0;
        return sum + price;
      }, 0);

      const productsTotal = (latestWalkin.products || []).reduce((sum, p) => {
        const total = p.total || (p.price || 0) * (p.quantity || 1);
        return sum + total;
      }, 0);

      const subtotal = servicesTotal + productsTotal;
      const discount = latestWalkin.discount || 0;
      const totalAmount = Math.max(subtotal - discount, 0);

      Modal.confirm({
        title: "Calculated Price",
        wrapClassName: isMobile
          ? "premium-modal mobile-center-modal"
          : "premium-modal",

        width: isMobile ? "92vw" : 520,
        centered: isMobile ? true : undefined,
        style: isMobile ? { padding: 0 } : undefined,

        maskClosable: false,
        keyboard: false,

        content: (
          <div className="space-y-2 py-4">
            <div className="flex justify-between">
              <span>Services Total:</span>
              <span className="font-semibold">₹{servicesTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Products Total:</span>
              <span className="font-semibold">₹{productsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="font-semibold text-red-600">
                -₹{discount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-green-600 text-lg">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        ),
        okText: "Save to Walk-in",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await api.put(`/walkins/${walkin._id}`, {
              subtotal,
              totalAmount,
              discount,
            });
            message.success("Price calculated and saved!");
            await fetchWalkins();
          } catch (error) {
            message.error(
              error.response?.data?.message || "Failed to save calculated price"
            );
          }
        },
      });
    } catch {
      message.error("Failed to calculate price");
    }
  };

  // ===== Filtering (basic + advanced) =====
  const filteredWalkins = useMemo(() => {
    return walkins.filter((walkin) => {
      const matchesSearch =
        searchText === "" ||
        walkin.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
        walkin.walkinNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
        walkin.customerPhone?.includes(searchText);

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

      let matchesAdvanced = true;

      if (hasActiveAdvancedFilters()) {
        if (dateRange && dateRange[0] && dateRange[1]) {
          const walkinDate = new Date(walkin.createdAt || walkin.walkinDate);
          const startDate = dateRange[0].toDate
            ? dateRange[0].toDate()
            : new Date(dateRange[0]);
          const endDate = dateRange[1].toDate
            ? dateRange[1].toDate()
            : new Date(dateRange[1]);
          endDate.setHours(23, 59, 59, 999);
          if (walkinDate < startDate || walkinDate > endDate)
            matchesAdvanced = false;
        }

        if (
          advancedStatusFilter !== "all" &&
          walkin.status !== advancedStatusFilter
        )
          matchesAdvanced = false;

        if (
          advancedBranchFilter !== "all" &&
          walkin.branch !== advancedBranchFilter
        )
          matchesAdvanced = false;

        if (
          paymentStatusFilter !== "all" &&
          walkin.paymentStatus !== paymentStatusFilter
        )
          matchesAdvanced = false;

        const totalAmount = walkin.totalAmount || 0;
        if (minAmount !== null && totalAmount < minAmount)
          matchesAdvanced = false;
        if (maxAmount !== null && totalAmount > maxAmount)
          matchesAdvanced = false;

        if (
          customerNameFilter &&
          !walkin.customerName
            ?.toLowerCase()
            .includes(customerNameFilter.toLowerCase())
        )
          matchesAdvanced = false;

        if (phoneFilter && !walkin.customerPhone?.includes(phoneFilter))
          matchesAdvanced = false;

        if (
          walkinNumberFilter &&
          !walkin.walkinNumber
            ?.toLowerCase()
            .includes(walkinNumberFilter.toLowerCase())
        )
          matchesAdvanced = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBranch &&
        matchesDate &&
        matchesAdvanced
      );
    });
  }, [
    walkins,
    searchText,
    statusFilter,
    branchFilter,
    dateFilter,
    dateRange,
    advancedStatusFilter,
    advancedBranchFilter,
    paymentStatusFilter,
    minAmount,
    maxAmount,
    customerNameFilter,
    phoneFilter,
    walkinNumberFilter,
  ]);

  // ===== Quick Actions (FULL RESTORED + overflow fix) =====
  const QuickActions = ({ record }) => {
    const servicesArr = record.services || [];
    const productsArr = record.products || [];
    const employeesCount = servicesArr.filter((s) => s.staff).length;

    const hasSelections = servicesArr.length > 0 || productsArr.length > 0;
    const statusMeta = getStatusTag(record.status);
    const paymentMeta = getPaymentTag(record.paymentStatus);

    const openServices = () => {
      setCurrentWalkin(record);
      setServiceModalVisible(true);
    };
    const openEmployees = () => {
      setCurrentWalkin(record);
      setEmployeeModalVisible(true);
    };
    const openProducts = () => {
      setCurrentWalkin(record);
      setProductModalVisible(true);
    };
    const openStatus = () => handleUpdateStatus(record);
    const openPayment = () => handleUpdatePayment(record);
    const openCalc = () => handleCalculatePrice(record);

    const menuItems = [
      {
        key: "header",
        label: (
          <div style={{ padding: "6px 4px" }}>
            <div
              style={{
                fontWeight: 700,
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>{record.walkinNumber}</span>
              <Tag color={statusMeta.color} style={{ margin: 0 }}>
                {statusMeta.text}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              {record.customerName} • {record.customerPhone}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              Total: ₹{record.totalAmount?.toFixed(2) || "0.00"} •{" "}
              <Tag color={paymentMeta.color} style={{ margin: 0 }}>
                {paymentMeta.text}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              Seat: {getSeatLabel(record)}
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },

      {
        key: "m1",
        label: <b style={{ fontSize: 12, color: "#6b7280" }}>MANAGE</b>,
        disabled: true,
      },
      {
        key: "services",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Scissors className="w-4 h-4" />
              <span>Services</span>
            </span>
            <Tag color={servicesArr.length ? "blue" : "default"} style={{ margin: 0 }}>
              {servicesArr.length}
            </Tag>
          </div>
        ),
        onClick: openServices,
      },
      {
        key: "employees",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </span>
            <Tag color={employeesCount ? "green" : "default"} style={{ margin: 0 }}>
              {employeesCount}
            </Tag>
          </div>
        ),
        onClick: openEmployees,
        disabled: servicesArr.length === 0,
      },
      {
        key: "products",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShoppingBag className="w-4 h-4" />
              <span>Products</span>
            </span>
            <Tag color={productsArr.length ? "gold" : "default"} style={{ margin: 0 }}>
              {productsArr.length}
            </Tag>
          </div>
        ),
        onClick: openProducts,
      },

      { type: "divider" },

      {
        key: "m2",
        label: <b style={{ fontSize: 12, color: "#6b7280" }}>BILLING</b>,
        disabled: true,
      },
      {
        key: "status",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span>Status</span>
            <Tag color={statusMeta.color} style={{ margin: 0 }}>
              {statusMeta.text}
            </Tag>
          </div>
        ),
        onClick: openStatus,
      },
      {
        key: "payment",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign className="w-4 h-4" />
              Payment
            </span>
            <Tag color={paymentMeta.color} style={{ margin: 0 }}>
              {paymentMeta.text}
            </Tag>
          </div>
        ),
        onClick: openPayment,
      },

      { type: "divider" },

      {
        key: "calc",
        label: (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calculator className="w-4 h-4" />
              Calculate & Save
            </span>
            <Tag color={hasSelections ? "cyan" : "default"} style={{ margin: 0 }}>
              {hasSelections ? "READY" : "PENDING"}
            </Tag>
          </div>
        ),
        onClick: openCalc,
        disabled: !hasSelections,
      },
    ];

    return (
      <Space size="small" wrap className={isMobile ? "mobile-actions" : ""}>
        <Tooltip title={hasSelections ? "Calculate Price" : "Select services/products first"}>
          <Button
            size="small"
            type="primary"
            disabled={!hasSelections}
            icon={<Calculator className="w-4 h-4" />}
            onClick={(e) => {
              e?.stopPropagation?.();
              openCalc();
            }}
          >
            {isMobile ? "Calc" : "Calculate"}
          </Button>
        </Tooltip>

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          // ✅ IMPORTANT: keep dropdown inside viewport + prevent right overflow
          overlayStyle={{
            width: isMobile ? 310 : 320,
            maxWidth: "92vw",
          }}
          getPopupContainer={(trigger) => trigger?.parentElement || document.body}
          menu={{ items: menuItems }}
        >
          <Button
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e?.stopPropagation?.()}
          />
        </Dropdown>
      </Space>
    );
  };

  // ===== Desktop Table Columns =====
  const columns = [
    {
      title: "Walk-in #",
      dataIndex: "walkinNumber",
      key: "walkinNumber",
      width: 120,
      sorter: (a, b) =>
        (a.walkinNumber || "").localeCompare(b.walkinNumber || ""),
    },
    {
      title: "Customer",
      key: "customer",
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.customerName}</div>
          <div className="text-sm text-gray-500">{record.customerPhone}</div>
          <div className="text-xs text-gray-400">{record.branch}</div>
        </div>
      ),
    },
    {
      title: "Seat",
      key: "seat",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Tag color="purple" style={{ margin: 0 }}>
          {getSeatLabel(record)}
        </Tag>
      ),
    },
    {
      title: "Services",
      key: "services",
      width: 260,
      render: (_, record) => (
        <div>
          {record.services?.slice(0, 2).map((s, i) => (
            <Tag key={i} color="blue" style={{ marginBottom: 6 }}>
              {s.service?.name || "Service"}
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
      width: 130,
      align: "center",
      render: (status) => {
        const meta = getStatusTag(status);
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: "Total",
      key: "totalAmount",
      width: 140,
      align: "right",
      render: (_, record) => (
        <Tag color="green" className="font-bold">
          ₹{record.totalAmount?.toFixed(2) || "0.00"}
        </Tag>
      ),
    },
    {
      title: "Quick Actions",
      key: "manage",
      width: 240,
      fixed: "right",
      render: (_, record) => <QuickActions record={record} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showWalkinDetails(record)}
            />
          </Tooltip>
          <Tooltip title="PDF">
            <Button
              type="text"
              icon={<FilePdfOutlined />}
              onClick={() => handleDownloadPDF(record._id)}
            />
          </Tooltip>
          <Tooltip title="QR">
            <Button
              type="text"
              icon={<QrcodeOutlined />}
              onClick={() => handleShowQR(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ===== Stats =====
  const totalAmountSum = filteredWalkins.reduce(
    (sum, w) => sum + (w.totalAmount || 0),
    0
  );
  const totalInProgress = filteredWalkins.filter(
    (w) => w.status === "in_progress"
  ).length;
  const totalCompleted = filteredWalkins.filter(
    (w) => w.status === "completed"
  ).length;

  // ===== Mobile Card =====
  const MobileWalkinCard = ({ w }) => {
    const statusMeta = getStatusTag(w.status);
    const paymentMeta = getPaymentTag(w.paymentStatus);

    return (
      <Card
        size="small"
        className="mobile-walkin-card"
        style={{ borderRadius: 14 }}
        bodyStyle={{ padding: 12 }}
        onClick={() => showWalkinDetails(w)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontWeight: 800 }}>{w.walkinNumber}</div>
          <Tag color={statusMeta.color} style={{ margin: 0 }}>
            {statusMeta.text}
          </Tag>
        </div>

        <div style={{ marginTop: 6, color: "#374151" }}>
          <div style={{ fontWeight: 700 }}>{w.customerName}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {w.customerPhone} • {w.branch}
          </div>

          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            Seat: <span style={{ fontWeight: 700 }}>{getSeatLabel(w)}</span>
          </div>
        </div>

        <Divider style={{ margin: "10px 0" }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(w.services || []).slice(0, 2).map((s, i) => (
            <Tag key={`s-${i}`} color="blue" style={{ margin: 0 }}>
              {s.service?.name || "Service"}
            </Tag>
          ))}
          {(w.services || []).length > 2 && (
            <Tag color="cyan" style={{ margin: 0 }}>
              +{(w.services || []).length - 2} Services
            </Tag>
          )}

          {(w.products || []).slice(0, 1).map((p, i) => (
            <Tag key={`p-${i}`} color="gold" style={{ margin: 0 }}>
              {p.product?.name || "Product"}
            </Tag>
          ))}
          {(w.products || []).length > 1 && (
            <Tag color="gold" style={{ margin: 0 }}>
              +{(w.products || []).length - 1} Products
            </Tag>
          )}
        </div>

        <Divider style={{ margin: "10px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Total</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>
              ₹{w.totalAmount?.toFixed(2) || "0.00"}
            </div>
          </div>
          <Tag color={paymentMeta.color} style={{ margin: 0 }}>
            {paymentMeta.text}
          </Tag>
        </div>

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div onClick={(e) => e.stopPropagation()}>
            <QuickActions record={w} />
          </div>

          <Space onClick={(e) => e.stopPropagation()}>
            <Tooltip title="PDF">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => handleDownloadPDF(w._id)}
              />
            </Tooltip>
            <Tooltip title="QR">
              <Button
                size="small"
                icon={<QrcodeOutlined />}
                onClick={() => handleShowQR(w)}
              />
            </Tooltip>
          </Space>
        </div>
      </Card>
    );
  };

  // ✅ select dropdown container: on mobile, body better (prevents clipping), but must stop overflow
  // We will mount to body for safety + force maxWidth via dropdownStyle/css.
  const selectPopupContainer = () => document.body;

  return (
    <>
      <style>{`
        /* ✅ Premium modal look */
        .premium-modal .ant-modal-content {
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18) !important;
          overflow: hidden;
        }
        .premium-modal .ant-modal-header {
          border-bottom: 1px solid rgba(148, 163, 184, 0.25) !important;
          padding: 14px 16px !important;
          background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.98) 100%) !important;
        }
        .premium-modal .ant-modal-title { font-weight: 800 !important; }
        .premium-modal .ant-modal-footer {
          border-top: 1px solid rgba(148, 163, 184, 0.25) !important;
          padding: 12px 16px !important;
          background: rgba(249,250,251,0.98) !important;
        }
        .premium-modal .ant-modal-close {
          border-radius: 10px !important;
        }
        .premium-modal .ant-modal-close:hover {
          background: rgba(148, 163, 184, 0.18) !important;
        }
        .premium-modal .ant-modal-mask {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ✅ Dropdown polish + prevent overflow on small screens */
        .ant-dropdown, .ant-dropdown-menu {
          max-width: 92vw !important;
        }
        .ant-dropdown-menu {
          border-radius: 14px !important;
          overflow: hidden !important;
        }
        .ant-dropdown-menu-item:hover { background: #f5f7ff !important; }

        /* ✅ Make dropdown scroll if too tall */
        .ant-dropdown-menu {
          max-height: 70vh !important;
          overflow-y: auto !important;
        }

        /* ✅ Mobile-only improvements */
        @media (max-width: 767px) {
          .mobile-actions { width: 100%; justify-content: space-between; }
          .mobile-walkin-card { width: 100%; }
          .ant-list-item { padding: 6px 0 !important; }

          /* Dropdown touch friendly */
          .ant-dropdown-menu-item {
            padding: 12px 12px !important;
            border-radius: 12px;
            margin: 6px 6px;
          }

          /* ✅ Center modals in mobile */
          .mobile-center-modal .ant-modal {
            width: 92vw !important;
            max-width: 92vw !important;
            margin: 0 auto !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            padding-bottom: 0 !important;
          }
          .mobile-center-modal .ant-modal-body {
            max-height: calc(100vh - 180px) !important;
            overflow: auto !important;
          }

          /* ✅ Select dropdown max width */
          .ant-select-dropdown {
            max-width: 92vw !important;
          }
        }

        /* ✅ 390px HARD FIX PACK (filters overflow) */
        @media (max-width: 390px) {
          html, body, #root { width: 100%; overflow-x: hidden !important; }

          .walkin-filters-card,
          .walkin-filters-card .ant-card-body {
            width: 100%;
            overflow-x: hidden !important;
            overflow: visible !important;
          }

          /* gutter negative margins killer */
          .walkin-filters-row {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
          }

          /* Col padding remove + allow shrink */
          .walkin-filters-col {
            padding-left: 0 !important;
            padding-right: 0 !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }

          /* Inputs/Selects safe */
          .walkin-filters-card .ant-input-affix-wrapper,
          .walkin-filters-card .ant-select {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .walkin-filters-card .ant-select-selector {
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .walkin-filters-card .ant-select-selection-item {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            max-width: 100% !important;
          }

          /* actions stacked */
          .walkin-filters-actions-col {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .walkin-btn { width: 100% !important; min-width: 0 !important; }

          .ant-select-dropdown { max-width: 92vw !important; }
          .ant-dropdown { max-width: 92vw !important; }
        }
      `}</style>

      {/* Filters */}
      <Card
        size="small"
        className="mb-4 walkin-filters-card"
        style={{ borderRadius: 14 }}
      >
        <Row gutter={[10, 10]} align="middle" className="walkin-filters-row">
          <Col xs={24} md={8} className="walkin-filters-col">
            <Input
              placeholder="Search name / walk-in # / phone"
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={12} md={4} className="walkin-filters-col">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              getPopupContainer={selectPopupContainer}
              dropdownStyle={{ maxWidth: "92vw" }}
            >
              <Option value="all">All Status</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4} className="walkin-filters-col">
            <Select
              value={branchFilter}
              onChange={setBranchFilter}
              style={{ width: "100%" }}
              getPopupContainer={selectPopupContainer}
              dropdownStyle={{ maxWidth: "92vw" }}
            >
              <Option value="all">All Branches</Option>
              {branches.map((b) => (
                <Option key={b._id} value={b.name}>
                  {b.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4} className="walkin-filters-col">
            <Select
              value={dateFilter}
              onChange={setDateFilter}
              style={{ width: "100%" }}
              getPopupContainer={selectPopupContainer}
              dropdownStyle={{ maxWidth: "92vw" }}
            >
              <Option value="all">All Dates</Option>
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
            </Select>
          </Col>

          <Col xs={24} md={4} className="walkin-filters-col walkin-filters-actions-col">
            <Button
              className="walkin-btn"
              icon={<FilterOutlined />}
              type={hasActiveAdvancedFilters() ? "primary" : "default"}
              onClick={() => setAdvancedOpen(true)}
            >
              {isMobile ? "Advanced" : `Advanced ${hasActiveAdvancedFilters() ? "• Active" : ""}`}
            </Button>

            <Button className="walkin-btn" icon={<ClearOutlined />} onClick={clearBasicFilters}>
              Clear
            </Button>

            <Button className="walkin-btn" icon={<ReloadOutlined />} onClick={fetchWalkins}>
              Refresh
            </Button>

            {!isMobile && (
              <Button className="walkin-btn" type="primary" icon={<ExportOutlined />} onClick={exportToExcel}>
                Export
              </Button>
            )}
          </Col>

          {isMobile && (
            <Col xs={24} className="walkin-filters-col">
              <Button block type="primary" icon={<ExportOutlined />} onClick={exportToExcel}>
                Export to Excel
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[10, 10]} className="mb-4">
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderRadius: 14 }}>
            <Statistic title="Total" value={filteredWalkins.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderRadius: 14 }}>
            <Statistic title="In Progress" value={totalInProgress} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderRadius: 14 }}>
            <Statistic title="Completed" value={totalCompleted} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small" style={{ borderRadius: 14 }}>
            <Statistic title="Amount" value={totalAmountSum} precision={2} formatter={(value) => `₹${value}`} />
          </Card>
        </Col>
      </Row>

      {/* MOBILE: Card/List view  |  DESKTOP: Table */}
      {isMobile ? (
        <List
          split={false}
          dataSource={filteredWalkins}
          renderItem={(w) => (
            <List.Item style={{ padding: "8px 0" }}>
              <MobileWalkinCard w={w} />
            </List.Item>
          )}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredWalkins}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} walk-ins`,
          }}
          scroll={{ x: 1220, y: "calc(100vh - 360px)" }}
          size="middle"
          bordered
        />
      )}

      {/* Advanced Filters Drawer */}
      <Drawer
        title="Advanced Filters"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        width={isMobile ? "100%" : 440}
        extra={
          <Space>
            <Button onClick={clearAdvancedFilters} icon={<ClearOutlined />}>
              Clear
            </Button>
          </Space>
        }
      >
        <AdvancedFilterPanel
          branches={branches}
          filteredWalkins={filteredWalkins}
          allWalkins={walkins}
          dateRange={dateRange}
          setDateRange={setDateRange}
          advancedStatusFilter={advancedStatusFilter}
          setAdvancedStatusFilter={setAdvancedStatusFilter}
          advancedBranchFilter={advancedBranchFilter}
          setAdvancedBranchFilter={setAdvancedBranchFilter}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
          minAmount={minAmount}
          setMinAmount={setMinAmount}
          maxAmount={maxAmount}
          setMaxAmount={setMaxAmount}
          customerNameFilter={customerNameFilter}
          setCustomerNameFilter={setCustomerNameFilter}
          phoneFilter={phoneFilter}
          setPhoneFilter={setPhoneFilter}
          walkinNumberFilter={walkinNumberFilter}
          setWalkinNumberFilter={setWalkinNumberFilter}
          hasActiveAdvancedFilters={hasActiveAdvancedFilters}
          clearAdvancedFilters={clearAdvancedFilters}
        />
      </Drawer>

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

      {/* Inline Service Selector Modal */}
      {currentWalkin && (
        <InlineServiceSelector
          visible={serviceModalVisible}
          onClose={() => {
            setServiceModalVisible(false);
            setCurrentWalkin(null);
          }}
          walkin={currentWalkin}
          services={services}
          categories={categories}
          onServicesSelected={(selectedServices) =>
            handleServicesSelected(currentWalkin._id, selectedServices)
          }
        />
      )}

      {/* Inline Employee Selector Modal */}
      {currentWalkin && (
        <InlineEmployeeSelector
          visible={employeeModalVisible}
          onClose={() => {
            setEmployeeModalVisible(false);
            setCurrentWalkin(null);
          }}
          walkin={currentWalkin}
          onEmployeesSelected={(selectedEmployees) =>
            handleEmployeesSelected(currentWalkin._id, selectedEmployees)
          }
        />
      )}

      {/* Inline Product Selector Modal */}
      {currentWalkin && (
        <InlineProductSelector
          visible={productModalVisible}
          onClose={() => {
            setProductModalVisible(false);
            setCurrentWalkin(null);
          }}
          walkin={currentWalkin}
          products={products}
          onProductsSelected={(selectedProducts) =>
            handleProductsSelected(currentWalkin._id, selectedProducts)
          }
        />
      )}

      {/* Status Update Modal */}
      {currentWalkin && (
        <Modal
          title="Update Walk-in Status"
          open={statusModalVisible}
          onCancel={() => {
            setStatusModalVisible(false);
            setCurrentWalkin(null);
            setSelectedStatus("");
          }}
          onOk={handleSaveStatus}
          okText="Update Status"
          cancelText="Cancel"
          width={isMobile ? "92vw" : 420}
          centered={isMobile ? true : undefined}
          style={isMobile ? { padding: 0 } : undefined}
          wrapClassName={isMobile ? "premium-modal mobile-center-modal" : "premium-modal"}
          maskClosable={false}
          keyboard={false}
        >
          <div className="py-4">
            <div className="mb-2">
              <span className="text-sm font-medium">Select New Status:</span>
            </div>

            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              size="large"
              getPopupContainer={selectPopupContainer}
              dropdownStyle={{ maxWidth: "92vw" }}
            >
              <Option value="draft">Draft</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>
        </Modal>
      )}

      {/* Payment Update Modal */}
      {currentWalkin && (
        <Modal
          title="Update Payment"
          open={paymentModalVisible}
          onCancel={() => {
            setPaymentModalVisible(false);
            setCurrentWalkin(null);
            setPaymentAmount(0);
            setPaymentMethod("cash");
            setDiscountValue(0);
            setDiscountType("amount");
          }}
          onOk={handleSavePayment}
          okText="Update Payment"
          cancelText="Cancel"
          width={isMobile ? "92vw" : 420}
          centered={isMobile ? true : undefined}
          style={isMobile ? { padding: 0 } : undefined}
          wrapClassName={isMobile ? "premium-modal mobile-center-modal" : "premium-modal"}
          maskClosable={false}
          keyboard={false}
        >
          <div className="py-4 space-y-4">
            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Subtotal:</span>
              </div>
              <Tag color="blue" className="text-lg font-bold">
                ₹{(currentWalkin.subtotal || currentWalkin.totalAmount || 0).toFixed(2)}
              </Tag>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Discount:</span>
              </div>
              <div className="flex gap-2 mb-2">
                <Select
                  value={discountType}
                  onChange={setDiscountType}
                  style={{ width: 140 }}
                  size="large"
                  getPopupContainer={selectPopupContainer}
                  dropdownStyle={{ maxWidth: "92vw" }}
                >
                  <Option value="amount">Amount (₹)</Option>
                  <Option value="percentage">Percentage (%)</Option>
                </Select>

                <InputNumber
                  value={discountValue}
                  onChange={(value) => setDiscountValue(value || 0)}
                  style={{ flex: 1 }}
                  size="large"
                  min={0}
                  max={
                    discountType === "percentage"
                      ? 100
                      : currentWalkin.subtotal || currentWalkin.totalAmount || 0
                  }
                  formatter={(value) =>
                    discountType === "percentage"
                      ? `${value}%`
                      : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₹\s?|%|(,*)/g, "")}
                />
              </div>

              {discountValue > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Discount: ₹{calculateDiscountAmount().toFixed(2)}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Total After Discount:</span>
              </div>
              <Tag color="green" className="text-lg font-bold">
                ₹{calculateTotalAfterDiscount().toFixed(2)}
              </Tag>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Amount Paid:</span>
              </div>
              <InputNumber
                value={paymentAmount}
                onChange={(value) => setPaymentAmount(value || 0)}
                style={{ width: "100%" }}
                size="large"
                min={0}
                max={calculateTotalAfterDiscount()}
                formatter={(value) =>
                  `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              />
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Payment Method:</span>
              </div>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                style={{ width: "100%" }}
                size="large"
                getPopupContainer={selectPopupContainer}
                dropdownStyle={{ maxWidth: "92vw" }}
              >
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="online">Online</Option>
              </Select>
            </div>

            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Amount:</span>
                <span className="font-semibold">
                  ₹{Math.max(calculateTotalAfterDiscount() - (paymentAmount || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default WalkinList;