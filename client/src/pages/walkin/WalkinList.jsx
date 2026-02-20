// WalkinList.jsx — FULL PAGE (390px overflow FIX PACK)
// ✅ Includes ALL hard fixes:
// 1) 390px: Filters Row gutter neutralize (no negative margins)
// 2) 390px: All controls min-width:0 + width:100%
// 3) 390px: Actions become full-width stacked (no button overflow)
// 4) 390px: Select dropdown rendered inside parent (getPopupContainer)
// 5) 390px: Global overflow-x hidden for html/body/root (safe)
// 6) Optional: Debug helper (commented) to find overflow element fast

import React, { useState, useMemo } from "react";
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
      Branch: walkin.branch,
      Seat: getSeatLabel(walkin),
      "Total Amount": walkin.totalAmount,
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
      message.error(
        error.response?.data?.message || "Failed to assign employees"
      );
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

  // ===== Mobile Card Row (unchanged) =====
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
      </Card>
    );
  };

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

  return (
    <>
      <style>{`
        /* ✅ Premium look (safe, minimal) */
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
        .premium-modal .ant-modal-close { border-radius: 10px !important; }
        .premium-modal .ant-modal-close:hover { background: rgba(148, 163, 184, 0.18) !important; }
        .premium-modal .ant-modal-mask {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ✅ Mobile base fixes */
        @media (max-width: 767px) {
          .mobile-walkin-card { width: 100%; }
        }

        /* ✅ HARD FIX PACK for 390px */
        @media (max-width: 390px) {
          html, body, #root { width: 100%; overflow-x: hidden !important; }

          /* FILTERS: kill gutter negative margin overflow ONLY for this block */
          .walkin-filters-card,
          .walkin-filters-card .ant-card-body {
            width: 100%;
            overflow-x: hidden !important;
          }
          .walkin-filters-row {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
          }
          .walkin-filters-col {
            padding-left: 0 !important;
            padding-right: 0 !important;
            min-width: 0 !important;
          }

          /* all inputs/selects full width and shrinkable */
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

          /* actions full-width stacked (no overflow from button min width) */
          .walkin-filters-actions-col {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .walkin-btn { width: 100% !important; min-width: 0 !important; }

          /* dropdown never exceed screen */
          .ant-select-dropdown { max-width: 92vw !important; }
          .ant-select-item-option-content {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        /* dropdown polish */
        .ant-dropdown-menu-item:hover { background: #f5f7ff !important; }

        /* ✅ OPTIONAL DEBUG (uncomment to see overflow culprit)
        * { outline: 1px solid rgba(255,0,0,0.12); }
        */
      `}</style>

      {/* ✅ FILTERS (390px safe) */}
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

          {/* 390px -> xs=24 (single column), >=576 -> sm=12, desktop -> md=4 */}
          <Col xs={24} sm={12} md={4} className="walkin-filters-col">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              getPopupContainer={(trigger) => trigger.parentElement}
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
              getPopupContainer={(trigger) => trigger.parentElement}
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
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              <Option value="all">All Dates</Option>
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
            </Select>
          </Col>

          {/* Actions */}
          <Col
            xs={24}
            md={4}
            className="walkin-filters-col walkin-filters-actions-col"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
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

      {/* ✅ Stats */}
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
            <Statistic
              title="Amount"
              value={totalAmountSum}
              precision={2}
              formatter={(value) => `₹${value}`}
            />
          </Card>
        </Col>
      </Row>

      {/* ✅ MOBILE: Card/List view  |  DESKTOP: Table */}
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

      {/* ✅ Advanced Filters Drawer */}
      <Drawer
        title="Advanced Filters"
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        width={isMobile ? "100%" : 440}
        className={isMobile ? "mobile-drawer" : ""}
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

      {/* ✅ QR Modal */}
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

      {/* ✅ Inline Service Selector Modal */}
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

      {/* ✅ Inline Employee Selector Modal */}
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

      {/* ✅ Inline Product Selector Modal */}
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

      {/* ✅ Status Update Modal */}
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
            <div className="mb-4">
              <span className="text-sm text-gray-600">Current Status: </span>
              <Tag color={getStatusTag(currentWalkin.status).color}>
                {(currentWalkin.status || "draft").toUpperCase()}
              </Tag>
            </div>

            <div className="mb-2">
              <span className="text-sm font-medium">Select New Status:</span>
            </div>

            <Select value={selectedStatus} onChange={setSelectedStatus} style={{ width: "100%" }} size="large">
              <Option value="draft">Draft</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>
        </Modal>
      )}

      {/* ✅ Payment Update Modal */}
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
                <Select value={discountType} onChange={setDiscountType} style={{ width: 140 }} size="large">
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
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
              />
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Payment Method:</span>
              </div>
              <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: "100%" }} size="large">
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