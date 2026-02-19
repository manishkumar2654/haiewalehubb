import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Download,
  Calculator,
  Scissors,
  Users,
  ShoppingBag,
  DollarSign,
  Search,
  Filter,
  RefreshCcw,
  FileDown,
  QrCode,
  Eye,
  MoreVertical,
  X,
  CheckCircle2,
  Clock3,
  BadgeIndianRupee,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../../services/api";
import QRModal from "./QRModal";
import InlineServiceSelector from "./InlineServiceSelector";
import InlineEmployeeSelector from "./InlineEmployeeSelector";
import InlineProductSelector from "./InlineProductSelector";
import AdvancedFilterPanel from "./AdvancedFilterPanel";

/* ----------------------------- small utils ----------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

function useIsMobile(breakpointPx = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);
  return isMobile;
}

function currencyINR(n) {
  const v = Number(n || 0);
  return `₹${v.toFixed(2)}`;
}

/* ----------------------------- UI components ---------------------------- */
const Badge = ({ color = "gray", children }) => {
  const map = {
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    purple: "bg-purple-50 text-purple-700 ring-purple-200",
    gold: "bg-amber-50 text-amber-800 ring-amber-200",
    cyan: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        map[color] || map.gray
      )}
    >
      {children}
    </span>
  );
};

const Card = ({ className, children, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "rounded-2xl border border-slate-200 bg-white shadow-sm",
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "",
      className
    )}
  >
    {children}
  </div>
);

const CardHeader = ({ title, right }) => (
  <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
    <div className="font-extrabold text-slate-900">{title}</div>
    {right}
  </div>
);

const CardBody = ({ children, className }) => (
  <div className={cn("px-4 py-3", className)}>{children}</div>
);

const Button = ({
  children,
  variant = "default",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const v = {
    default:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    primary:
      "bg-slate-900 text-white border border-slate-900 hover:bg-slate-800",
    danger: "bg-rose-600 text-white border border-rose-600 hover:bg-rose-700",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100 border border-transparent",
  };
  const s = {
    sm: "h-9 px-3 text-sm rounded-xl",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-11 px-4 text-base rounded-2xl",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        v[variant] || v.default,
        s[size] || s.md,
        className
      )}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className="truncate">{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};

const Input = ({ className, leftIcon, ...props }) => (
  <div className={cn("relative w-full", className)}>
    {leftIcon ? (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {leftIcon}
      </span>
    ) : null}
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300",
        leftIcon ? "pl-10" : ""
      )}
      {...props}
    />
  </div>
);

const Select = ({ className, ...props }) => (
  <select
    className={cn(
      "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300",
      className
    )}
    {...props}
  />
);

const Divider = () => <div className="h-px w-full bg-slate-100" />;

const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={() => {}}
      />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="font-extrabold text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-auto px-4 py-3">
            {children}
          </div>
          {footer ? (
            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Drawer = ({ open, title, children, onClose, rightSlot }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="font-extrabold text-slate-900">{title}</div>
          <div className="flex items-center gap-2">
            {rightSlot}
            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-56px)] overflow-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

function useOutsideClose(ref, open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, ref]);
}

const Dropdown = ({ open, anchorRef, onClose, children }) => {
  const panelRef = useRef(null);
  useOutsideClose(panelRef, open, onClose);

  if (!open) return null;

  const rect = anchorRef?.current?.getBoundingClientRect?.();
  const top = rect ? rect.bottom + 8 : 80;
  const right = rect ? window.innerWidth - rect.right : 12;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <div
        ref={panelRef}
        className="pointer-events-auto absolute w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white shadow-xl"
        style={{ top, right }}
      >
        {children}
      </div>
    </div>
  );
};

/* ------------------------------ main page ------------------------------ */
const WalkinList = ({ walkins, fetchWalkins, branches, services, categories, products }) => {
  const isMobile = useIsMobile(768);

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
      draft: { color: "gray", text: "Draft" },
      confirmed: { color: "blue", text: "Confirmed" },
      in_progress: { color: "orange", text: "In Progress" },
      completed: { color: "green", text: "Completed" },
      cancelled: { color: "red", text: "Cancelled" },
    };
    return map[status] || { color: "gray", text: status || "N/A" };
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
      const res = await api.get(`/walkins/${walkinId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `walkin-${walkinId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert("PDF downloaded successfully!");
    } catch {
      alert("Failed to download PDF");
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
    XLSX.writeFile(wb, `walkins_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    alert("Walkins exported to Excel successfully!");
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

      await api.put(`/walkins/${walkinId}/replace-services`, { services: servicesPayload });

      alert("Services saved!");
      await fetchWalkins();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save services");
    }
  };

  const handleEmployeesSelected = async (walkinId, selectedEmployees) => {
    try {
      const walkinResponse = await api.get(`/walkins/${walkinId}`);
      const current = walkinResponse.data?.data || walkinResponse.data;
      if (!current) return alert("Walk-in not found");

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
        await api.put(`/walkins/${walkinId}`, { services: servicesWithEmployees });
      }

      alert("Employees assigned successfully!");
      await fetchWalkins();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign employees");
    }
  };

  const handleProductsSelected = async (walkinId, selectedProducts) => {
    try {
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: Number(p.quantity) || 1,
        price: Number(p.price) || 0,
      }));

      await api.put(`/walkins/${walkinId}/replace-products`, { products: productsPayload });

      alert("Products saved!");
      await fetchWalkins();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save products");
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
      alert("Status unchanged");
      setStatusModalVisible(false);
      return;
    }

    try {
      const res = await api.patch(`/walkins/${currentWalkin._id}/status-only`, { status: selectedStatus });

      if (res.data.success) {
        alert(`Status updated to ${selectedStatus.toUpperCase()}`);
        setStatusModalVisible(false);
        setCurrentWalkin(null);
        setSelectedStatus("");
        await fetchWalkins();
      } else {
        alert(res.data.message || "Failed to update status");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
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
      if (percentage > 0 && percentage <= 100 && Math.abs(percentage - Math.round(percentage)) < 0.01) {
        setDiscountType("percentage");
      } else setDiscountType("amount");
    } else setDiscountType("amount");

    setPaymentModalVisible(true);
  };

  const calculateDiscountAmount = () => {
    if (!currentWalkin) return 0;
    const subtotal = currentWalkin.subtotal || currentWalkin.totalAmount || 0;
    if (discountType === "percentage") return (subtotal * (discountValue || 0)) / 100;
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
        alert("Payment updated successfully");
        setPaymentModalVisible(false);
        setCurrentWalkin(null);
        setPaymentAmount(0);
        setPaymentMethod("cash");
        setDiscountValue(0);
        setDiscountType("amount");
        await fetchWalkins();
      } else {
        alert(res.data.message || "Failed to update payment");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update payment");
    }
  };

  // Calculate price
  const handleCalculatePrice = async (walkin) => {
    try {
      const response = await api.get(`/walkins/${walkin._id}`);
      const latestWalkin = response.data?.data || response.data;
      if (!latestWalkin) return alert("Failed to fetch walk-in data");

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

      const ok = window.confirm(
        `Calculated Price\n\nServices: ${currencyINR(servicesTotal)}\nProducts: ${currencyINR(
          productsTotal
        )}\nSubtotal: ${currencyINR(subtotal)}\nDiscount: ${currencyINR(discount)}\n\nTotal: ${currencyINR(
          totalAmount
        )}\n\nSave to Walk-in?`
      );

      if (ok) {
        await api.put(`/walkins/${walkin._id}`, { subtotal, totalAmount, discount });
        alert("Price calculated and saved!");
        await fetchWalkins();
      }
    } catch {
      alert("Failed to calculate price");
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

      const matchesStatus = statusFilter === "all" || walkin.status === statusFilter;
      const matchesBranch = branchFilter === "all" || walkin.branch === branchFilter;

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
          const startDate = dateRange[0]?.toDate ? dateRange[0].toDate() : new Date(dateRange[0]);
          const endDate = dateRange[1]?.toDate ? dateRange[1].toDate() : new Date(dateRange[1]);
          endDate.setHours(23, 59, 59, 999);
          if (walkinDate < startDate || walkinDate > endDate) matchesAdvanced = false;
        }

        if (advancedStatusFilter !== "all" && walkin.status !== advancedStatusFilter) matchesAdvanced = false;
        if (advancedBranchFilter !== "all" && walkin.branch !== advancedBranchFilter) matchesAdvanced = false;
        if (paymentStatusFilter !== "all" && walkin.paymentStatus !== paymentStatusFilter) matchesAdvanced = false;

        const totalAmount = walkin.totalAmount || 0;
        if (minAmount !== null && totalAmount < minAmount) matchesAdvanced = false;
        if (maxAmount !== null && totalAmount > maxAmount) matchesAdvanced = false;

        if (customerNameFilter && !walkin.customerName?.toLowerCase().includes(customerNameFilter.toLowerCase()))
          matchesAdvanced = false;

        if (phoneFilter && !walkin.customerPhone?.includes(phoneFilter)) matchesAdvanced = false;

        if (walkinNumberFilter && !walkin.walkinNumber?.toLowerCase().includes(walkinNumberFilter.toLowerCase()))
          matchesAdvanced = false;
      }

      return matchesSearch && matchesStatus && matchesBranch && matchesDate && matchesAdvanced;
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

  // ===== Stats =====
  const totalAmountSum = filteredWalkins.reduce((sum, w) => sum + (w.totalAmount || 0), 0);
  const totalInProgress = filteredWalkins.filter((w) => w.status === "in_progress").length;
  const totalCompleted = filteredWalkins.filter((w) => w.status === "completed").length;

  // ===== Details (Tailwind modal instead of antd) =====
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsWalkin, setDetailsWalkin] = useState(null);

  const showWalkinDetails = (walkin) => {
    setDetailsWalkin(walkin);
    setDetailsOpen(true);
  };

  // ===== Quick Actions (Tailwind dropdown) =====
  const QuickActions = ({ record }) => {
    const servicesArr = record.services || [];
    const productsArr = record.products || [];
    const employeesCount = servicesArr.filter((s) => s.staff).length;

    const hasSelections = servicesArr.length > 0 || productsArr.length > 0;
    const statusMeta = getStatusTag(record.status);
    const paymentMeta = getPaymentTag(record.paymentStatus);

    const menuBtnRef = useRef(null);
    const [open, setOpen] = useState(false);

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

    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          disabled={!hasSelections}
          leftIcon={<Calculator className="h-4 w-4" />}
          onClick={(e) => {
            e?.stopPropagation?.();
            openCalc();
          }}
          className={cn("shrink-0", isMobile ? "px-3" : "")}
        >
          {isMobile ? "Calc" : "Calculate"}
        </Button>

        <button
          ref={menuBtnRef}
          onClick={(e) => {
            e?.stopPropagation?.();
            setOpen((v) => !v);
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          aria-label="More"
        >
          <MoreVertical className="h-4 w-4 text-slate-700" />
        </button>

        <Dropdown
          open={open}
          anchorRef={menuBtnRef}
          onClose={() => setOpen(false)}
        >
          <div className="p-3">
            <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-2">
                <div className="font-extrabold text-slate-900">
                  {record.walkinNumber}
                </div>
                <Badge color={statusMeta.color}>{statusMeta.text}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {record.customerName} • {record.customerPhone}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-600">
                <span>Total: {currencyINR(record.totalAmount)}</span>
                <Badge color={paymentMeta.color}>{paymentMeta.text}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Seat: <span className="font-bold text-slate-800">{getSeatLabel(record)}</span>
              </div>
            </div>

            <div className="mt-3 text-xs font-extrabold tracking-wide text-slate-500">
              MANAGE
            </div>

            <div className="mt-2 grid gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  openServices();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Scissors className="h-4 w-4" /> Services
                </span>
                <Badge color={servicesArr.length ? "blue" : "gray"}>
                  {servicesArr.length}
                </Badge>
              </button>

              <button
                disabled={servicesArr.length === 0}
                onClick={() => {
                  setOpen(false);
                  openEmployees();
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50",
                  servicesArr.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Users className="h-4 w-4" /> Employees
                </span>
                <Badge color={employeesCount ? "green" : "gray"}>
                  {employeesCount}
                </Badge>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  openProducts();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShoppingBag className="h-4 w-4" /> Products
                </span>
                <Badge color={productsArr.length ? "gold" : "gray"}>
                  {productsArr.length}
                </Badge>
              </button>
            </div>

            <div className="mt-4 text-xs font-extrabold tracking-wide text-slate-500">
              BILLING
            </div>

            <div className="mt-2 grid gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  openStatus();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-900">Status</span>
                <Badge color={statusMeta.color}>{statusMeta.text}</Badge>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  openPayment();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <DollarSign className="h-4 w-4" /> Payment
                </span>
                <Badge color={paymentMeta.color}>{paymentMeta.text}</Badge>
              </button>
            </div>

            <div className="mt-4">
              <button
                disabled={!hasSelections}
                onClick={() => {
                  setOpen(false);
                  openCalc();
                }}
                className={cn(
                  "w-full rounded-2xl px-3 py-2 text-sm font-extrabold",
                  hasSelections
                    ? "bg-cyan-50 text-cyan-900 ring-1 ring-cyan-200 hover:bg-cyan-100"
                    : "bg-slate-50 text-slate-400 ring-1 ring-slate-200 cursor-not-allowed"
                )}
              >
                Calculate & Save {hasSelections ? "• READY" : "• PENDING"}
              </button>
            </div>
          </div>
        </Dropdown>
      </div>
    );
  };

  // ===== Desktop Table =====
  const TableDesktop = () => (
    <Card className="overflow-hidden">
      <div className="hidden md:block overflow-auto">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-extrabold">Walk-in #</th>
              <th className="px-4 py-3 font-extrabold">Customer</th>
              <th className="px-4 py-3 font-extrabold text-center">Seat</th>
              <th className="px-4 py-3 font-extrabold">Services</th>
              <th className="px-4 py-3 font-extrabold text-center">Status</th>
              <th className="px-4 py-3 font-extrabold text-right">Total</th>
              <th className="px-4 py-3 font-extrabold">Quick Actions</th>
              <th className="px-4 py-3 font-extrabold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredWalkins.map((record) => {
              const statusMeta = getStatusTag(record.status);
              return (
                <tr
                  key={record._id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => showWalkinDetails(record)}
                >
                  <td className="px-4 py-3 font-extrabold text-slate-900">
                    {record.walkinNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{record.customerName}</div>
                    <div className="text-xs text-slate-500">{record.customerPhone}</div>
                    <div className="text-xs text-slate-400">{record.branch}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge color="purple">{getSeatLabel(record)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(record.services || []).slice(0, 2).map((s, i) => (
                        <Badge key={i} color="blue">
                          {s.service?.name || "Service"}
                        </Badge>
                      ))}
                      {(record.services || []).length > 2 ? (
                        <Badge color="cyan">+{(record.services || []).length - 2}</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge color={statusMeta.color}>{statusMeta.text}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex rounded-xl bg-emerald-50 px-3 py-1 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                      {currencyINR(record.totalAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <QuickActions record={record} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        onClick={() => showWalkinDetails(record)}
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4 text-slate-700" />
                      </button>
                      <button
                        className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        onClick={() => handleDownloadPDF(record._id)}
                        aria-label="PDF"
                      >
                        <Download className="h-4 w-4 text-slate-700" />
                      </button>
                      <button
                        className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        onClick={() => handleShowQR(record)}
                        aria-label="QR"
                      >
                        <QrCode className="h-4 w-4 text-slate-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredWalkins.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                  No walk-ins found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // ===== Mobile Card =====
  const MobileWalkinCard = ({ w }) => {
    const statusMeta = getStatusTag(w.status);
    const paymentMeta = getPaymentTag(w.paymentStatus);

    return (
      <Card
        className="w-full"
        onClick={() => showWalkinDetails(w)}
      >
        <CardBody className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="font-extrabold text-slate-900">{w.walkinNumber}</div>
            <Badge color={statusMeta.color}>{statusMeta.text}</Badge>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-slate-900">{w.customerName}</div>
            <div className="text-xs text-slate-600">
              {w.customerPhone} • {w.branch}
            </div>
            <div className="text-xs text-slate-600">
              Seat: <span className="font-extrabold text-slate-800">{getSeatLabel(w)}</span>
            </div>
          </div>

          <Divider />

          <div className="flex flex-wrap gap-2">
            {(w.services || []).slice(0, 2).map((s, i) => (
              <Badge key={`s-${i}`} color="blue">
                {s.service?.name || "Service"}
              </Badge>
            ))}
            {(w.services || []).length > 2 ? (
              <Badge color="cyan">+{(w.services || []).length - 2} Services</Badge>
            ) : null}

            {(w.products || []).slice(0, 1).map((p, i) => (
              <Badge key={`p-${i}`} color="gold">
                {p.product?.name || "Product"}
              </Badge>
            ))}
            {(w.products || []).length > 1 ? (
              <Badge color="gold">+{(w.products || []).length - 1} Products</Badge>
            ) : null}
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-lg font-extrabold text-slate-900">
                {currencyINR(w.totalAmount)}
              </div>
            </div>
            <Badge color={paymentMeta.color}>{paymentMeta.text}</Badge>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div onClick={(e) => e.stopPropagation()}>
              <QuickActions record={w} />
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                onClick={() => handleDownloadPDF(w._id)}
                aria-label="PDF"
              >
                <Download className="h-4 w-4 text-slate-700" />
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                onClick={() => handleShowQR(w)}
                aria-label="QR"
              >
                <QrCode className="h-4 w-4 text-slate-700" />
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  // ===== Stats cards =====
  const StatCard = ({ icon, title, value, sub }) => (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-500">{title}</div>
            <div className="mt-1 text-xl font-extrabold text-slate-900">{value}</div>
            {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
          </div>
          <div className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100">
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <div className="text-xs font-bold text-slate-500 mb-1">Search</div>
              <Input
                placeholder="Search name / walk-in # / phone"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-5 md:grid-cols-3">
              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">Status</div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 mb-1">Branch</div>
                <Select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                  <option value="all">All Branches</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="text-xs font-bold text-slate-500 mb-1">Date</div>
                <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                </Select>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  variant={hasActiveAdvancedFilters() ? "primary" : "default"}
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setAdvancedOpen(true)}
                >
                  {isMobile ? "Advanced" : `Advanced ${hasActiveAdvancedFilters() ? "• Active" : ""}`}
                </Button>

                <Button
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={clearBasicFilters}
                >
                  Clear
                </Button>

                <Button
                  leftIcon={<RefreshCcw className="h-4 w-4" />}
                  onClick={fetchWalkins}
                >
                  Refresh
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<FileDown className="h-4 w-4" />}
                  onClick={exportToExcel}
                  className={cn(isMobile ? "w-full" : "")}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          title="Total"
          value={filteredWalkins.length}
          icon={<Users className="h-5 w-5 text-slate-700" />}
        />
        <StatCard
          title="In Progress"
          value={totalInProgress}
          icon={<Clock3 className="h-5 w-5 text-slate-700" />}
        />
        <StatCard
          title="Completed"
          value={totalCompleted}
          icon={<CheckCircle2 className="h-5 w-5 text-slate-700" />}
        />
        <StatCard
          title="Amount"
          value={currencyINR(totalAmountSum)}
          icon={<BadgeIndianRupee className="h-5 w-5 text-slate-700" />}
        />
      </div>

      {/* MOBILE: Cards | DESKTOP: Table */}
      {isMobile ? (
        <div className="space-y-3">
          {filteredWalkins.map((w) => (
            <MobileWalkinCard key={w._id} w={w} />
          ))}
          {filteredWalkins.length === 0 ? (
            <Card>
              <CardBody className="py-10 text-center text-slate-500">
                No walk-ins found.
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : (
        <TableDesktop />
      )}

      {/* Advanced Filters Drawer */}
      <Drawer
        open={advancedOpen}
        title="Advanced Filters"
        onClose={() => setAdvancedOpen(false)}
        rightSlot={
          <Button size="sm" onClick={clearAdvancedFilters} leftIcon={<X className="h-4 w-4" />}>
            Clear
          </Button>
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

      {/* Details Modal */}
      <Modal
        open={detailsOpen}
        title={
          detailsWalkin
            ? `Walk-in Details: ${detailsWalkin.walkinNumber}`
            : "Walk-in Details"
        }
        onClose={() => {
          setDetailsOpen(false);
          setDetailsWalkin(null);
        }}
        footer={
          detailsWalkin ? (
            <div className="flex items-center justify-between gap-2">
              <Button
                leftIcon={<QrCode className="h-4 w-4" />}
                onClick={() => handleShowQR(detailsWalkin)}
              >
                View QR
              </Button>
              <Button
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => handleDownloadPDF(detailsWalkin._id)}
              >
                PDF
              </Button>
            </div>
          ) : null
        }
      >
        {detailsWalkin ? (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Customer Information" />
              <CardBody className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-bold text-slate-500">Customer Name</div>
                    <div className="text-lg font-extrabold text-slate-900">{detailsWalkin.customerName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Phone Number</div>
                    <div className="text-lg font-extrabold text-slate-900">{detailsWalkin.customerPhone}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-xs font-bold text-slate-500">Branch</div>
                    <div className="font-bold text-slate-900">{detailsWalkin.branch}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Seat</div>
                    <div className="font-bold text-slate-900">{getSeatLabel(detailsWalkin)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">Status</div>
                    <Badge color={getStatusTag(detailsWalkin.status).color}>
                      {(detailsWalkin.status || "draft").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {detailsWalkin.customerEmail ? (
                  <div>
                    <div className="text-xs font-bold text-slate-500">Email</div>
                    <div className="font-bold text-slate-900">{detailsWalkin.customerEmail}</div>
                  </div>
                ) : null}

                {detailsWalkin.customerAddress ? (
                  <div>
                    <div className="text-xs font-bold text-slate-500">Address</div>
                    <div className="font-bold text-slate-900">{detailsWalkin.customerAddress}</div>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            {(detailsWalkin.services || []).length > 0 ? (
              <Card>
                <CardHeader title={`Services (${detailsWalkin.services.length})`} />
                <CardBody className="space-y-2">
                  {detailsWalkin.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {service.service?.name || "Service"}
                        </div>
                        <div className="text-xs text-slate-600">
                          {service.category?.name || "Category"} • {service.duration || 0} mins
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {service.staff?.name ? `Staff: ${service.staff.name}` : "No staff assigned"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-700">
                          {currencyINR(service.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ) : null}

            {(detailsWalkin.products || []).length > 0 ? (
              <Card>
                <CardHeader title={`Products (${detailsWalkin.products.length})`} />
                <CardBody className="space-y-2">
                  {detailsWalkin.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {product.product?.name || "Product"}
                        </div>
                        <div className="text-xs text-slate-600">
                          Quantity: {product.quantity || 1} • {currencyINR(product.price)} each
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {product.stockDeducted ? "✓ Stock deducted" : "Stock pending"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-emerald-700">
                          {currencyINR(product.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            ) : null}

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader title="Payment Summary" />
              <CardBody className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Subtotal</span>
                  <span className="font-extrabold text-slate-900">
                    {currencyINR(detailsWalkin.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Discount</span>
                  <span className="font-extrabold text-rose-700">
                    -{currencyINR(detailsWalkin.discount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 text-sm">
                  <span className="text-slate-900 font-extrabold">Total Amount</span>
                  <span className="text-emerald-700 font-extrabold text-base">
                    {currencyINR(detailsWalkin.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Amount Paid</span>
                  <span className="font-extrabold text-slate-900">
                    {currencyINR(detailsWalkin.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 text-sm">
                  <span className="text-slate-900 font-extrabold">Due Amount</span>
                  <span
                    className={cn(
                      "font-extrabold text-base",
                      (detailsWalkin.dueAmount || 0) > 0 ? "text-rose-700" : "text-emerald-700"
                    )}
                  >
                    {currencyINR(detailsWalkin.dueAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Payment Status</span>
                  <Badge color={getPaymentTag(detailsWalkin.paymentStatus).color}>
                    {(detailsWalkin.paymentStatus || "unpaid").toUpperCase()}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}
      </Modal>

      {/* QR Modal */}
      {selectedQrData ? (
        <QRModal
          visible={qrModalVisible}
          qrData={selectedQrData}
          onClose={() => {
            setQrModalVisible(false);
            setSelectedQrData(null);
          }}
          onDownloadPDF={() => handleDownloadPDF(selectedQrData.walkinId)}
        />
      ) : null}

      {/* Inline Service Selector Modal */}
      {currentWalkin ? (
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
      ) : null}

      {/* Inline Employee Selector Modal */}
      {currentWalkin ? (
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
      ) : null}

      {/* Inline Product Selector Modal */}
      {currentWalkin ? (
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
      ) : null}

      {/* Status Update Modal */}
      <Modal
        open={statusModalVisible && !!currentWalkin}
        title="Update Walk-in Status"
        onClose={() => {
          setStatusModalVisible(false);
          setCurrentWalkin(null);
          setSelectedStatus("");
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                setStatusModalVisible(false);
                setCurrentWalkin(null);
                setSelectedStatus("");
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStatus}>
              Update Status
            </Button>
          </div>
        }
      >
        {currentWalkin ? (
          <div className="space-y-3">
            <div className="text-sm text-slate-700">
              Current Status:{" "}
              <Badge color={getStatusTag(currentWalkin.status).color}>
                {(currentWalkin.status || "draft").toUpperCase()}
              </Badge>
            </div>

            <div>
              <div className="mb-1 text-xs font-bold text-slate-500">Select New Status</div>
              <Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Payment Update Modal */}
      <Modal
        open={paymentModalVisible && !!currentWalkin}
        title="Update Payment"
        onClose={() => {
          setPaymentModalVisible(false);
          setCurrentWalkin(null);
          setPaymentAmount(0);
          setPaymentMethod("cash");
          setDiscountValue(0);
          setDiscountType("amount");
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                setPaymentModalVisible(false);
                setCurrentWalkin(null);
                setPaymentAmount(0);
                setPaymentMethod("cash");
                setDiscountValue(0);
                setDiscountType("amount");
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePayment}>
              Update Payment
            </Button>
          </div>
        }
      >
        {currentWalkin ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Subtotal</div>
              <div className="inline-flex rounded-2xl bg-blue-50 px-3 py-1.5 font-extrabold text-blue-800 ring-1 ring-blue-200">
                {currencyINR(currentWalkin.subtotal || currentWalkin.totalAmount || 0)}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Discount</div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <option value="amount">Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </Select>

                <input
                  type="number"
                  value={discountValue}
                  min={0}
                  max={discountType === "percentage" ? 100 : (currentWalkin.subtotal || currentWalkin.totalAmount || 0)}
                  onChange={(e) => setDiscountValue(Number(e.target.value || 0))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>

              {discountValue > 0 ? (
                <div className="mt-1 text-xs text-slate-500">
                  Discount: {currencyINR(calculateDiscountAmount())}
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Total After Discount</div>
              <div className="inline-flex rounded-2xl bg-emerald-50 px-3 py-1.5 font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                {currencyINR(calculateTotalAfterDiscount())}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Amount Paid</div>
              <input
                type="number"
                value={paymentAmount}
                min={0}
                max={calculateTotalAfterDiscount()}
                onChange={(e) => setPaymentAmount(Number(e.target.value || 0))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-1">Payment Method</div>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </Select>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Due Amount</span>
                <span className="font-extrabold text-slate-900">
                  {currencyINR(Math.max(calculateTotalAfterDiscount() - (paymentAmount || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default WalkinList;
