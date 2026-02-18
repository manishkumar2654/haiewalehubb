import React, { useState, useEffect } from "react";
import { message, Steps, Alert, Modal, Button, Tabs, Card } from "antd";
import {
  ExportOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import CustomerForm from "./CustomerForm";
import ServiceSelector from "./ServiceSelector";
import ProductSelector from "./ProductSelector";
import PaymentSummary from "./PaymentSummary";
import WalkinList from "./WalkinList";

const { Step } = Steps;
const { TabPane } = Tabs;

const WalkinBooking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [walkinData, setWalkinData] = useState(null);
  const [walkins, setWalkins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchDetails, setBranchDetails] = useState({});
  const [activeTab, setActiveTab] = useState("1"); // "1" for New Booking, "2" for All Walk-ins

  // Main form data
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
    branch: "",
    selectedServices: [],
    selectedProducts: [],
    selectedSeats: [],
    discount: 0,
    tax: 0,
    paymentMethod: "cash",
    amountPaid: 0,
  });

  useEffect(() => {
    fetchInitialData();
    fetchWalkins();
  }, []);

  useEffect(() => {
    if (formData.branch) {
      fetchBranchStaff(formData.branch);
      updateBranchDetails(formData.branch);
    }
  }, [formData.branch]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [branchesRes, catRes, servRes, prodRes] = await Promise.all([
        api.get("/walkins/branches/list"),
        api.get("/admin/categories"),
        api.get("/admin/services"),
        api.get("/products"),
      ]);

      setBranches(branchesRes.data.data || branchesRes.data);
      setCategories(catRes.data);
      setServices(servRes.data);
      setProducts(prodRes.data);

      if (branchesRes.data.data?.length > 0 && !formData.branch) {
        const defaultBranch = branchesRes.data.data[0].name;
        setFormData((prev) => ({ ...prev, branch: defaultBranch }));
      }

      message.success("Data loaded successfully!");
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch data. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const updateBranchDetails = (branchName) => {
    const branch = branches.find((b) => b.name === branchName);
    if (branch) {
      setBranchDetails(branch);
      if (branch.address) {
        setFormData((prev) => ({
          ...prev,
          customerAddress: branch.address,
        }));
      }
    }
  };

  const fetchBranchStaff = async (branchName) => {
    try {
      const staffRes = await api.get(
        `/walkins/staff/branch?branch=${branchName}`,
      );
      setAvailableStaff(staffRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch branch staff:", error);
      setAvailableStaff([]);
    }
  };

  const fetchWalkins = async () => {
    try {
      const res = await api.get("/walkins");
      setWalkins(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch walkins:", error);
      message.error("Failed to fetch walkins");
    }
  };

  const calculateTotals = () => {
    const servicesTotal = formData.selectedServices.reduce(
      (sum, service) => sum + (service.price || 0),
      0,
    );
    const productsTotal = formData.selectedProducts.reduce(
      (sum, product) => sum + (product.total || 0),
      0,
    );
    const seatsTotal = formData.selectedSeats.reduce(
      (sum, seat) => sum + (seat.total || 0),
      0,
    );
    const subtotal = servicesTotal + productsTotal + seatsTotal;
    const discountAmount = formData.discount || 0;
    const total = Math.max(subtotal - discountAmount, 0);
    const dueAmount = Math.max(total - (formData.amountPaid || 0), 0);

    return {
      servicesTotal,
      productsTotal,
      seatsTotal,
      subtotal,
      discountAmount,
      total,
      dueAmount,
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      let userData = null;
      try {
        userData = userStr ? JSON.parse(userStr) : null;
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
      }

      if (!userData || !userData._id) {
        message.error("User not logged in. Please login again.");
        setLoading(false);
        return;
      }

      const totals = calculateTotals();

      const servicesPayload = formData.selectedServices.map((s) => ({
        serviceId: s.serviceId,
        pricingId: s.pricingId,
        staffId: s.staffId || null,
      }));

      const productsPayload = formData.selectedProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity || 1,
      }));

      const seatsPayload = formData.selectedSeats.map((seat) => ({
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        duration: seat.duration || 1,
      }));

      const payload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail?.trim() || "",
        customerAddress: formData.customerAddress?.trim() || "",
        notes: formData.notes?.trim() || "",
        branch: formData.branch,
        services: servicesPayload,
        products: productsPayload,
        seats: seatsPayload,
        discount: formData.discount || 0,
        paymentMethod: formData.paymentMethod || "cash",
        amountPaid: formData.amountPaid || 0,
        createdBy: userData._id,
      };

      const res = await api.post("/walkins", payload);

      // ✅ SUCCESS - DO ALL ACTIONS
      message.success(
        `Walkin #${res.data.data.walkinNumber} created successfully!`,
      );

      // 1. Reset form
      resetForm();

      // 2. Fetch updated walkins list
      await fetchWalkins();

      // 3. Switch to "All Walk-ins" tab (Tab 2)
      setActiveTab("2");

      // 4. Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: "smooth" });

      // 5. Store the created walkin data
      setWalkinData(res.data.data);
    } catch (error) {
      console.error("Submit error details:", error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to create walkin");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: branchDetails.address || "",
      notes: "",
      branch: branches.length > 0 ? branches[0].name : "",
      selectedServices: [],
      selectedProducts: [],
      selectedSeats: [],
      discount: 0,
      tax: 0,
      paymentMethod: "cash",
      amountPaid: 0,
    });
    setCurrentStep(0);
  };

  // Steps for booking form
  const steps = [
    {
      title: "Customer Details",
      content: (
        <CustomerForm
          formData={formData}
          setFormData={setFormData}
          branches={branches}
          branchDetails={branchDetails}
        />
      ),
    },
    {
      title: "Select Services",
      content: (
        <ServiceSelector
          formData={formData}
          setFormData={setFormData}
          services={services}
          categories={categories}
          availableStaff={availableStaff}
        />
      ),
    },
    {
      title: "Select Products",
      content: (
        <ProductSelector
          formData={formData}
          setFormData={setFormData}
          products={products}
        />
      ),
    },
    {
      title: "Payment & Summary",
      content: (
        <PaymentSummary
          formData={formData}
          setFormData={setFormData}
          calculateTotals={calculateTotals}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 pt-20 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-2">
          Walk-in Booking System
        </h1>
        <p className="text-gray-600">Create and manage walk-in appointments</p>
      </div>

      {loading && (
        <Alert
          message="Loading data..."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
        {/* TAB 1: NEW WALK-IN BOOKING */}
        <TabPane tab="New Walk-in Booking" key="1">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <Steps current={currentStep} className="mb-6 md:mb-8">
              {steps.map((step) => (
                <Step key={step.title} title={step.title} />
              ))}
            </Steps>

            <div className="min-h-[400px]">{steps[currentStep].content}</div>

            <div className="flex justify-between mt-6 md:mt-8 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
                {/* Only show Save as Draft button at Customer Details step */}
                {currentStep === 0 && (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={
                      !formData.customerName ||
                      !formData.customerPhone ||
                      loading
                    }
                    loading={loading}
                  >
                    {loading ? "Creating..." : "Save as Draft"}
                  </Button>
                )}
              </div>

              {/* Only show Next button if not at Customer Details step */}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  disabled={
                    !formData.customerName || !formData.customerPhone || loading
                  }
                  loading={loading}
                >
                  {loading ? "Creating..." : "Create Walk-in"}
                </Button>
              )}
            </div>
          </div>
        </TabPane>

        {/* TAB 2: ALL WALK-INS */}
        <TabPane tab="All Walk-ins" key="2">
          <Card>
            <WalkinList
              walkins={walkins}
              fetchWalkins={fetchWalkins}
              branches={branches}
              services={services}
              categories={categories}
              products={products}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default WalkinBooking;
