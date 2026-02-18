import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  User,
  Calendar,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  Bell,
  CreditCard,
  MapPin,
  Star,
  HelpCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const UserProfileDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?._id) return setLoading(false);
      setLoading(true);
      try {
        const res = await api.get(
          `/appointments/users/${user._id}/appointments?timeRange=upcoming`
        );
        setAppointments(res.data || []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    // Set active tab based on current path
    const path = location.pathname;
    if (path.includes("my-appointments")) setActiveTab("appointments");
    else if (path.includes("orders")) setActiveTab("orders");
    else if (path.includes("favorites")) setActiveTab("favorites");
    else if (path.includes("settings")) setActiveTab("settings");
    else setActiveTab("overview");

    fetchAppointments();
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      case "Pending":
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-rose-100 text-rose-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const menuItems = [
    {
      id: "overview",
      title: "Overview",
      icon: User,
      path: "/dashboard",
    },
    {
      id: "appointments",
      title: "My Appointments",
      icon: Calendar,
      path: "/my-appointments",
      count: appointments.length,
    },
    {
      id: "orders",
      title: "Orders & Purchases",
      icon: ShoppingBag,
      path: "/orders",
      count: 0,
    },
    {
      id: "favorites",
      title: "Favorites",
      icon: Heart,
      path: "/favorites",
      count: 0,
    },
    {
      id: "addresses",
      title: "Addresses",
      icon: MapPin,
      path: "/address-management",
    },
    {
      id: "reviews",
      title: "My Reviews",
      icon: Star,
      path: "/reviews",
      count: 5,
    },
  ];

  const supportItems = [
    {
      id: "help",
      title: "Help & Support",
      icon: HelpCircle,
      path: "/help",
    },
    {
      id: "terms",
      title: "Terms & Policies",
      icon: FileText,
      path: "/terms",
    },
  ];

  const recentAppointments = appointments.slice(0, 2);

  return (
    <div className="min-h-screen  bg-gradient-to-br from-rose-50 to-amber-50  px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-[philosopher] mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 font-[poppins]">
            Here's what's happening with your account today.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30 mb-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-amber-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 font-[poppins]">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-gray-600 font-[poppins]">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center justify-between p-3 rounded-lg transition font-[poppins] ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="bg-rose-100 text-rose-700 text-xs font-medium px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
                {supportItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition font-[poppins] ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition font-[poppins]"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-[poppins]">
                    Book Appointment
                  </h3>
                  <div className="p-2 bg-gradient-to-r from-rose-100 to-amber-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4 font-[poppins]">
                  Schedule a new appointment with our professionals
                </p>
                <button
                  onClick={() => navigate("/appointment")}
                  className="w-full bg-gradient-to-r from-rose-700 to-amber-700 text-white py-2 px-4 rounded-lg hover:from-rose-800 hover:to-amber-800 transition flex items-center justify-center font-[poppins] font-medium"
                >
                  Book Now
                </button>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 font-[poppins]">
                    Your Orders
                  </h3>
                  <div className="p-2 bg-gradient-to-r from-rose-100 to-amber-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4 font-[poppins]">
                  View your order history and track recent purchases
                </p>
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center font-[poppins] font-medium"
                >
                  View Orders
                </button>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 font-[philosopher]">
                  Recent Appointments
                </h2>
                <Link
                  to="/my-appointments"
                  className="text-rose-700 hover:text-rose-800 font-medium text-sm inline-flex items-center font-[poppins]"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
                </div>
              ) : recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900 font-[poppins]">
                            {appointment.serviceId?.name || "Service"}
                          </h3>
                          <p className="text-sm text-gray-600 font-[poppins]">
                            {new Date(
                              appointment.appointmentDateTime
                            ).toLocaleDateString()}{" "}
                            •{" "}
                            {new Date(
                              appointment.appointmentDateTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {appointment.employeeId && (
                            <p className="text-sm text-gray-600 mt-1 font-[poppins]">
                              With: {appointment.employeeId.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )} font-[poppins]`}
                          >
                            {appointment.status}
                          </span>
                          <div className="hidden sm:block">
                            {getStatusIcon(appointment.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 font-[poppins]">
                    No appointments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 font-[poppins]">
                    You don't have any upcoming appointments.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate("/appointment")}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition font-[poppins] font-medium"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDashboard;
