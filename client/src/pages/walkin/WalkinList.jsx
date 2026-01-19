import React, { useState, useMemo } from "react";
import {
  Download,
  QrCode,
  Search,
  Calculator,
  Scissors,
  Users,
  ShoppingBag,
  X,
  CheckCircle,
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
import InlineServiceSelector from "./InlineServiceSelector";
import InlineEmployeeSelector from "./InlineEmployeeSelector";
import InlineProductSelector from "./InlineProductSelector";

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
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Inline editing modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentWalkin, setCurrentWalkin] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  // State for managing selections per walk-in
  const [walkinSelections, setWalkinSelections] = useState({});

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
            style={{ marginLeft: 'auto' }}
          />
        </div>
      ),
      width: 800,
      icon: null,
      closable: true, // Enable close button
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

  // Handle service selection - Use separate replace endpoint
  const handleServicesSelected = async (walkinId, selectedServices) => {
    try {
      // Prepare services payload
      const servicesPayload = selectedServices.map((s) => ({
        serviceId: String(s.serviceId),
        pricingId: String(s.pricingId),
        staffId: s.staffId ? String(s.staffId) : null,
        price: Number(s.price) || 0,
        duration: Number(s.duration) || 30,
      }));

      console.log("💾 Replacing services via separate endpoint:", servicesPayload);

      // Use the replace-services endpoint
      const response = await api.put(`/walkins/${walkinId}/replace-services`, {
        services: servicesPayload,
      });

      console.log("✅ Services replaced:", response.data);

      if (response.data?.data) {
        const updatedWalkin = response.data.data;
        setWalkinSelections((prev) => ({
          ...prev,
          [walkinId]: {
            ...prev[walkinId],
            services: updatedWalkin.services || [],
          },
        }));

        message.success(`Services saved! ${updatedWalkin.services?.length || 0} service(s).`);
      }

      // Refresh walkins list
      await fetchWalkins();
    } catch (error) {
      console.error("Failed to replace services:", error);
      message.error(error.response?.data?.message || "Failed to save services");
    }
  };

  // Handle employee selection
  const handleEmployeesSelected = async (walkinId, selectedEmployees) => {
    try {
      // First, fetch current walk-in to get existing services
      const walkinResponse = await api.get(`/walkins/${walkinId}`);
      const currentWalkin = walkinResponse.data?.data || walkinResponse.data;
      
      if (!currentWalkin) {
        message.error("Walk-in not found");
        return;
      }

      // Get existing services
      const existingServices = currentWalkin.services || [];

      // Assign employees to services (first employee to first service, etc.)
      const servicesWithEmployees = existingServices.map((service, index) => ({
        serviceId: service.service?._id || service.service,
        pricingId: service.pricing?._id || service.pricing,
        staffId: selectedEmployees[index]?._id || service.staff?._id || service.staff || null,
        price: service.price || 0,
        duration: service.duration || 30,
      }));

      if (servicesWithEmployees.length > 0) {
        const servicesPayload = servicesWithEmployees.map((s) => ({
          serviceId: s.serviceId,
          pricingId: s.pricingId,
          staffId: s.staffId || null,
          price: s.price,
          duration: s.duration,
        }));

        const response = await api.put(`/walkins/${walkinId}`, {
          services: servicesPayload,
        });

        // Fetch the updated walk-in from backend
        try {
          const updatedWalkinResponse = await api.get(`/walkins/${walkinId}`);
          const updatedWalkin = updatedWalkinResponse.data?.data || updatedWalkinResponse.data;
          
          if (updatedWalkin) {
            // Update local state with fetched data
            setWalkinSelections((prev) => ({
              ...prev,
              [walkinId]: {
                ...prev[walkinId],
                employees: selectedEmployees,
                services: updatedWalkin.services || [],
              },
            }));
          }
        } catch (fetchError) {
          console.error("Failed to fetch updated walk-in:", fetchError);
        }
      } else {
        // Just save employees for later use
        setWalkinSelections((prev) => ({
          ...prev,
          [walkinId]: {
            ...prev[walkinId],
            employees: selectedEmployees,
          },
        }));
      }

      message.success("Employees assigned successfully!");
      // Refresh walkins to get latest data
      await fetchWalkins();
    } catch (error) {
      console.error("Failed to assign employees:", error);
      message.error(error.response?.data?.message || "Failed to assign employees");
    }
  };

  // Handle product selection - Use separate replace endpoint
  const handleProductsSelected = async (walkinId, selectedProducts) => {
    try {
      // Prepare products payload
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: Number(p.quantity) || 1,
        price: Number(p.price) || 0,
      }));

      console.log("💾 Replacing products via separate endpoint:", productsPayload);

      // Use the replace-products endpoint
      const response = await api.put(`/walkins/${walkinId}/replace-products`, {
        products: productsPayload,
      });

      console.log("✅ Products replaced:", response.data);

      if (response.data?.data) {
        const updatedWalkin = response.data.data;
        setWalkinSelections((prev) => ({
          ...prev,
          [walkinId]: {
            ...prev[walkinId],
            products: updatedWalkin.products || [],
          },
        }));

        message.success(`Products saved! ${updatedWalkin.products?.length || 0} product(s).`);
      }

      // Refresh walkins list
      await fetchWalkins();
    } catch (error) {
      console.error("Failed to replace products:", error);
      message.error(error.response?.data?.message || "Failed to save products");
    }
  };

  // Handle status update
  const handleUpdateStatus = (walkin) => {
    setCurrentWalkin(walkin);
    setSelectedStatus(walkin.status || "draft");
    setStatusModalVisible(true);
  };

  // Save status update
  const handleSaveStatus = async () => {
    if (!currentWalkin) return;

    const currentStatus = currentWalkin.status || "draft";
    
    if (selectedStatus === currentStatus) {
      message.info("Status unchanged");
      setStatusModalVisible(false);
      return;
    }

    try {
      const response = await api.put(`/walkins/${currentWalkin._id}/status`, {
        status: selectedStatus,
      });

      if (response.data.success) {
        message.success(`Status updated to ${selectedStatus.toUpperCase()}`);
        setStatusModalVisible(false);
        setCurrentWalkin(null);
        await fetchWalkins();
      } else {
        message.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Handle price calculation
  const handleCalculatePrice = async (walkin) => {
    try {
      // Fetch the latest walk-in data from backend to ensure we have the most recent services/products
      const response = await api.get(`/walkins/${walkin._id}`);
      const latestWalkin = response.data?.data || response.data;

      if (!latestWalkin) {
        message.error("Failed to fetch walk-in data");
        return;
      }

      console.log("Latest walk-in data for calculation:", latestWalkin);
      console.log("Services:", latestWalkin.services);
      console.log("Products:", latestWalkin.products);

      // Calculate from fresh backend data
      const servicesTotal = (latestWalkin.services || []).reduce(
        (sum, s) => {
          const price = s.price || (s.service?.pricing?.[0]?.price) || 0;
          console.log(`Service: ${s.service?.name || 'Unknown'}, Price: ${price}`);
          return sum + price;
        },
        0
      );
      const productsTotal = (latestWalkin.products || []).reduce(
        (sum, p) => {
          const total = p.total || (p.price || 0) * (p.quantity || 1);
          console.log(`Product: ${p.product?.name || 'Unknown'}, Total: ${total}`);
          return sum + total;
        },
        0
      );

      console.log("Calculated totals:", { servicesTotal, productsTotal });

      const subtotal = servicesTotal + productsTotal;
      const discount = latestWalkin.discount || 0;
      const totalAmount = Math.max(subtotal - discount, 0);

      // Show calculated price
      Modal.confirm({
        title: "Calculated Price",
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
            // Update walk-in with calculated price
            const updateResponse = await api.put(`/walkins/${walkin._id}`, {
              subtotal,
              totalAmount,
              discount,
            });

            message.success("Price calculated and saved successfully!");
            // Refresh walkins to show updated price
            await fetchWalkins();
          } catch (error) {
            console.error("Failed to save price:", error);
            message.error(error.response?.data?.message || "Failed to save calculated price");
          }
        },
      });
    } catch (error) {
      console.error("Failed to calculate price:", error);
      message.error("Failed to calculate price");
    }
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
      title: "Total Amount",
      key: "totalAmount",
      width: 150,
      render: (_, record) => (
        <Tag color="green" className="font-bold">
          ₹{record.totalAmount?.toFixed(2) || "0.00"}
        </Tag>
      ),
    },
    {
      title: "Manage",
      key: "manage",
      width: 400,
      fixed: "right",
      render: (_, record) => {
        // Always use data from backend (record) - it's the source of truth
        // walkinSelections is only for temporary state during editing
        const services = record.services || [];
        const products = record.products || [];
        const hasSelections =
          (Array.isArray(services) && services.length > 0) ||
          (Array.isArray(products) && products.length > 0);
        
        // Get employee count from services (staff assigned)
        const employeesCount = services.filter(s => s.staff).length;

        return (
          <Space size="small" wrap>
            <Tooltip title="Select Services">
              <Button
                size="small"
                type="default"
                icon={<Scissors className="w-3 h-3" />}
                onClick={() => {
                  setCurrentWalkin(record);
                  setServiceModalVisible(true);
                }}
              >
                Services ({Array.isArray(services) ? services.length : 0})
              </Button>
            </Tooltip>

            <Tooltip title="Select Employees">
              <Button
                size="small"
                type="default"
                icon={<Users className="w-3 h-3" />}
                onClick={() => {
                  setCurrentWalkin(record);
                  setEmployeeModalVisible(true);
                }}
              >
                Employees ({employeesCount})
              </Button>
            </Tooltip>

            <Tooltip title="Select Products">
              <Button
                size="small"
                type="default"
                icon={<ShoppingBag className="w-3 h-3" />}
                onClick={() => {
                  setCurrentWalkin(record);
                  setProductModalVisible(true);
                }}
              >
                Products ({Array.isArray(products) ? products.length : 0})
              </Button>
            </Tooltip>

            <Tooltip title="Calculate Price">
              <Button
                size="small"
                type="primary"
                icon={<Calculator className="w-3 h-3" />}
                disabled={!hasSelections}
                onClick={() => handleCalculatePrice(record)}
              >
                Calculate
              </Button>
            </Tooltip>

            <Tooltip title="Update Status">
              <Button
                size="small"
                type="default"
                icon={<CheckCircle className="w-3 h-3" />}
                onClick={() => handleUpdateStatus(record)}
              >
                Status
              </Button>
            </Tooltip>
          </Space>
        );
      },
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
          width={400}
        >
          <div className="py-4">
            <div className="mb-4">
              <span className="text-sm text-gray-600">Current Status: </span>
              <Tag
                color={
                  currentWalkin.status === "completed"
                    ? "green"
                    : currentWalkin.status === "cancelled"
                    ? "red"
                    : currentWalkin.status === "confirmed"
                    ? "blue"
                    : currentWalkin.status === "in_progress"
                    ? "orange"
                    : "default"
                }
              >
                {(currentWalkin.status || "draft").toUpperCase()}
              </Tag>
            </div>
            <div className="mb-2">
              <span className="text-sm font-medium">Select New Status:</span>
            </div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              size="large"
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
    </>
  );
};

export default WalkinList;
