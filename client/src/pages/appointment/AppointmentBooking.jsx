import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServiceSelection from "../../components/appointment/ServiceSelection";
import DateTimeSelection from "../../components/appointment/DateTimeSelection";
import RoomTypeSelection from "../../components/appointment/RoomTypeSelection";
import Confirmation from "../../components/appointment/Confirmation";
import AppointmentSteps from "../../components/appointment/AppointmentSteps";
import Summary from "../../components/appointment/Summary";
import CustomerDetails from "../../components/appointment/CustomerDetails";
import { Sparkles } from "lucide-react";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const AppointmentBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("services");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Enhanced background effects
  const BackgroundEffects = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-rose-200/30 blur-xl"></div>
      <div className="absolute top-40 right-20 w-20 h-20 rounded-full bg-amber-200/30 blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-28 h-28 rounded-full bg-rose-300/20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-amber-300/20 blur-xl"></div>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          api.get("/admin/services"),
          api.get("/admin/categories"),
        ]);

        const roomsRes = await api.get("/admin/rooms");
        const uniqueRoomTypes = Array.from(
          new Set(roomsRes.data.map((room) => room.type))
        ).map((type) => {
          const room = roomsRes.data.find((r) => r.type === type);
          return {
            type,
            price: room.price,
            capacity: room.capacity,
          };
        });

        setServices(servicesRes.data);
        setFilteredServices(servicesRes.data);
        setCategories(categoriesRes.data);
        setRoomTypes(uniqueRoomTypes);

        const razorpayLoadSuccess = await loadRazorpayScript();
        setRazorpayLoaded(razorpayLoadSuccess);
      } catch (err) {
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredServices(
        services.filter(
          (service) => service.category._id === selectedCategory._id
        )
      );
    } else {
      setFilteredServices(services);
    }
  }, [selectedCategory, services]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setSelectedDuration(null);
    setActiveTab("datetime-selection");
  };

  const handleViewServiceDetails = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration);
  };

  const handleDateTimeChange = (e) => {
    setSelectedDateTime(e.target.value);
  };
  // Check if selected service is massage
  const isMassageService = () => {
    return selectedService?.category?.name?.toLowerCase() === "massage";
  };
  const handleProceedToRoomSelection = () => {
    if (!selectedDuration) {
      toast.error("Please select a duration");
      return;
    }
    if (!selectedDateTime) {
      toast.error("Please select a date and time");
      return;
    }

    // Yeh naya condition add karo:
    if (isMassageService()) {
      // Agar massage service hai to room selection pe jao
      setActiveTab("room-selection");
    } else {
      // Agar massage service NAHI hai to skip karo
      if (
        user?.employeeRole === "receptionist" ||
        user?.role === "admin" ||
        user?.employeeRole === "manager"
      ) {
        setActiveTab("customer-details");
      } else {
        setActiveTab("summary");
      }
    }
  };

  const handleProceedToCustomerDetails = () => {
    if (!selectedRoomType) {
      toast.error("Please select a room type");
      return;
    }

    if (
      user?.employeeRole === "receptionist" ||
      user?.role === "admin" ||
      user?.employeeRole === "manager"
    ) {
      setActiveTab("customer-details");
    } else {
      setActiveTab("summary");
    }
  };

  const handleCustomerDetailsSubmit = (details) => {
    sessionStorage.setItem("tempCustomerDetails", JSON.stringify(details));
    setCustomerDetails(details);
    setActiveTab("summary");
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const processRazorpayPayment = async (appointmentData) => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(appointmentData.totalPrice * 100),
        currency: "INR",
        name: "Luxury Spa",
        description: `Appointment for ${selectedService.name}`,
        order_id: appointmentData.razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyResponse = await api.post("/orders/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              setAppointment(verifyResponse.data.appointment);
              setActiveTab("confirmation");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name:
            user.employeeRole === "receptionist" ||
            user?.role === "admin" ||
            user?.employeeRole === "manager"
              ? customerDetails.name
              : user.name,
          email:
            user.employeeRole === "receptionist" ||
            user?.role === "admin" ||
            user?.employeeRole === "manager"
              ? customerDetails.email
              : user.email,
          contact:
            user.employeeRole === "receptionist" ||
            user?.role === "admin" ||
            user?.employeeRole === "manager"
              ? customerDetails.phone
              : user.phone || "",
        },
        theme: {
          color: "#C2185B",
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (error) {
      toast.error("Failed to initialize payment");
    }
  };

  const handleConfirmBooking = async () => {
    // Room type check sirf massage services ke liye
    if (isMassageService() && !selectedRoomType) {
      toast.error("Please select a room type");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to book an appointment");
      return;
    }

    if (
      (user.employeeRole === "receptionist" ||
        user?.role === "admin" ||
        user?.employeeRole === "manager") &&
      (!customerDetails.name || !customerDetails.phone)
    ) {
      toast.error("Please enter customer name and phone number");
      return;
    }

    setLoading(true);
    try {
      // Yeh part update karo:
      const roomType = isMassageService()
        ? roomTypes.find((room) => room.type === selectedRoomType)
        : null;

      const totalPrice = calculateTotalPrice(); // Ye already sahi hai (1999)

      const appointmentData = {
        serviceId: selectedService._id,
        durationMinutes: selectedDuration.durationMinutes,
        price: selectedDuration.price,
        // Yeh 2 lines update karo:
        roomPrice: isMassageService() ? roomType?.price || 0 : 0,
        totalPrice: totalPrice,
        // Yeh line update karo:
        type: isMassageService() ? selectedRoomType : "Silver", // Non-massage ke liye "Standard"
        appointmentDateTime: selectedDateTime,
        paymentMethod: paymentMethod,
      };

      console.log("🔍 Sending to backend:", appointmentData);

      if (
        user.employeeRole === "receptionist" ||
        user?.role === "admin" ||
        user?.employeeRole === "manager"
      ) {
        const tempDetails = sessionStorage.getItem("tempCustomerDetails");
        const customerData = tempDetails
          ? JSON.parse(tempDetails)
          : customerDetails;

        appointmentData.customerDetails = customerData;
      }

      const response = await api.post(
        "/appointments/auto-assign",
        appointmentData
      );

      if (paymentMethod === "online") {
        if (!razorpayLoaded) {
          toast.error("Payment system not available. Please try again.");
          return;
        }
        await processRazorpayPayment(response.data);
      } else {
        setAppointment(response.data.appointment);
        setActiveTab("confirmation");
      }
    } catch (err) {
      console.error("❌ Booking error details:", err);
      console.error("❌ Error response:", err.response?.data);
      toast.error(
        err.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    console.log("🔍 calculateTotalPrice called:");
    console.log("  - selectedDuration:", selectedDuration);
    console.log("  - selectedDuration.price:", selectedDuration?.price);
    console.log("  - selectedRoomType:", selectedRoomType);
    console.log("  - isMassageService():", isMassageService());
    console.log("  - roomTypes:", roomTypes);

    if (!selectedDuration) {
      console.log("❌ No duration selected, returning 0");
      return 0;
    }

    let total = selectedDuration.price;
    console.log("  - Base price (duration):", total);

    if (isMassageService() && selectedRoomType) {
      const roomType = roomTypes.find((room) => room.type === selectedRoomType);
      console.log("  - Room type found:", roomType);
      total += roomType ? roomType.price : 0;
      console.log("  - Added room price:", roomType?.price);
    } else {
      console.log("  - Not a massage service or no room selected");
    }

    console.log("  - Final total:", total);
    return total;
  };
  const getCreatedByText = () => {
    if (
      user?.employeeRole === "receptionist" ||
      user?.employeeRole === "manager"
    ) {
      return `${
        user.employeeRole.charAt(0).toUpperCase() + user.employeeRole.slice(1)
      }: ${user.name}`;
    }
    if (user?.role === "admin") {
      return `Admin: ${user.name}`;
    }
    return `Customer: ${user?.name}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50">
      <BackgroundEffects />

      {/* Enhanced Hero Section */}
      <section className="relative w-full h-[40vh] min-h-[400px] overflow-hidden">
        <img
          src="/appoinmenthero.png"
          alt="Spa treatment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Sparkles className="h-4 w-4 text-rose-200" />
              <span className="text-sm font-[poppins] text-white font-medium">
                Luxury Experience
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[philosopher] mb-4 text-white">
              Book Your Appointment
            </h1>
            <p className="text-lg font-[poppins] text-rose-100 max-w-2xl mx-auto">
              Indulge in our premium spa treatments for ultimate relaxation and
              rejuvenation
            </p>
          </div>
        </div>
      </section>

      <div className="relative py-8 px-4 sm:px-6 lg:px-8 -mt-20">
        <ToastContainer position="top-center" autoClose={5000} />

        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-rose-200/50 shadow-sm">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span className="text-sm font-[poppins] text-rose-700 font-medium">
                Easy Booking Process
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-[philosopher] mb-3 text-rose-900">
              Create Your Perfect Spa Day
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-rose-400 to-amber-400 mx-auto rounded-full"></div>
          </div>

          <AppointmentSteps
            activeTab={activeTab}
            selectedService={selectedService}
            selectedDuration={selectedDuration}
            selectedDateTime={selectedDateTime}
            isReceptionist={user?.employeeRole === "receptionist"}
            setActiveTab={setActiveTab}
          />

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            {activeTab === "services" && (
              <ServiceSelection
                categories={categories}
                filteredServices={filteredServices}
                loading={loading}
                selectedCategory={selectedCategory}
                handleSelectCategory={handleSelectCategory}
                handleSelectService={handleSelectService}
                handleViewServiceDetails={handleViewServiceDetails}
              />
            )}

            {activeTab === "datetime-selection" && selectedService && (
              <DateTimeSelection
                selectedService={selectedService}
                selectedDuration={selectedDuration}
                selectedDateTime={selectedDateTime}
                handleSelectDuration={handleSelectDuration}
                handleDateTimeChange={handleDateTimeChange}
                handleProceedToRoomSelection={handleProceedToRoomSelection}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "room-selection" && (
              <RoomTypeSelection
                roomTypes={roomTypes}
                selectedRoomType={selectedRoomType}
                setSelectedRoomType={setSelectedRoomType}
                selectedService={selectedService}
                selectedDuration={selectedDuration}
                selectedDateTime={selectedDateTime}
                handleProceedToSummary={handleProceedToCustomerDetails}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "customer-details" &&
              (user?.employeeRole === "receptionist" ||
                user?.role === "admin" ||
                user?.employeeRole === "manager") && (
                <CustomerDetails
                  customerDetails={customerDetails}
                  setCustomerDetails={setCustomerDetails}
                  onSubmit={handleCustomerDetailsSubmit}
                  onBack={() => setActiveTab("room-selection")}
                />
              )}

            {activeTab === "summary" && (
              <Summary
                selectedService={selectedService}
                selectedDuration={selectedDuration}
                selectedRoomType={selectedRoomType}
                roomTypes={roomTypes}
                selectedDateTime={selectedDateTime}
                totalPrice={calculateTotalPrice()}
                paymentMethod={paymentMethod}
                handlePaymentMethodChange={handlePaymentMethodChange}
                handleConfirmBooking={handleConfirmBooking}
                loading={loading}
                setActiveTab={setActiveTab}
                createdBy={getCreatedByText()}
                customerDetails={
                  user?.employeeRole === "receptionist" ? customerDetails : null
                }
                currentUser={user}
                isMassageService={isMassageService()}
              />
            )}

            {activeTab === "confirmation" && appointment && (
              <Confirmation
                appointment={appointment}
                selectedDuration={selectedDuration}
                navigate={navigate}
                setActiveTab={setActiveTab}
                setSelectedService={setSelectedService}
                setSelectedDuration={setSelectedDuration}
                setAppointment={setAppointment}
                createdBy={getCreatedByText()}
                customerDetails={
                  user?.employeeRole === "receptionist" ? customerDetails : null
                }
                isMassageService={isMassageService()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
