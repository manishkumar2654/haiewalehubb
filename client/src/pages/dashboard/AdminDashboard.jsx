import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Calendar,
  Home,
  Scissors,
  Settings,
  Building,
  ChevronRight,
  BarChart3,
  Shield,
  Briefcase,
  MapPin,
  Layers,
  Activity,
} from "lucide-react";
import AdminEmployeeManagement from "./AdminEmployeeManagement";
import ServiceManagement from "./ServiceManagement";
import RoomManagement from "./RoomManagement";
import AdminAppointmentManagement from "./AdminAppointmentManagement";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";
import BranchManagement from "./BranchManagement";
import { ROLES, EMPLOYEE_ROLES } from "../../utils/constants";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState("right"); // Animation direction
  const [refreshKeys, setRefreshKeys] = useState({
    services: 0,
    products: 0,
    orders: 0,
    appointments: 0,
    employee: 0,
    rooms: 0,
    branches: 0,
  });

  // ✅ Configurable Role-Based Access Control
  const roleBasedTabs = {
    [ROLES.ADMIN]: [
      "dashboard",
      "appointments",
      "employee",
      "services",
      "branches",
      "rooms",
      "products",
      "orders",
    ],
    [EMPLOYEE_ROLES.MANAGER]: [
      "dashboard",
      "appointments",
      "employee",
      "services",
      "branches",
      "rooms",
      "products",
      "orders",
    ],
    [EMPLOYEE_ROLES.RECEPTIONIST]: [
      "dashboard",
      "appointments",
      "services",
      "branches",
      "rooms",
    ],
    [EMPLOYEE_ROLES.THERAPIST]: ["dashboard", "appointments"],
    default: ["dashboard"],
  };

  // All available tabs with their configurations
  const allTabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "System overview and statistics",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      description: "Manage all appointments",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: "employee",
      label: "Employees",
      icon: Users,
      description: "Manage staff and employees",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      id: "services",
      label: "Services",
      icon: Scissors,
      description: "Manage spa services",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      id: "branches",
      label: "Branches",
      icon: Building,
      description: "Manage spa branches",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      id: "rooms",
      label: "Rooms",
      icon: Layers,
      description: "Manage treatment rooms",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      description: "Manage store products",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
      description: "Manage customer orders",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  // Get user's actual role
  const getUserRole = () => {
    if (!user) return null;
    if (user.role === ROLES.EMPLOYEE && user.employeeRole) {
      return user.employeeRole;
    }
    return user.role;
  };

  // Get accessible tabs for current user
  const getAccessibleTabs = () => {
    const userRole = getUserRole();
    if (!userRole) return allTabs.filter((tab) => tab.id === "dashboard");

    const allowedTabIds = roleBasedTabs[userRole] || roleBasedTabs.default;
    return allTabs.filter((tab) => allowedTabIds.includes(tab.id));
  };

  const accessibleTabs = getAccessibleTabs();

  // Handle tab change with animation
  const handleTabChange = (tabId) => {
    if (activeTab === tabId) return;

    // Determine animation direction based on current index
    const currentIndex = accessibleTabs.findIndex(
      (tab) => tab.id === activeTab
    );
    const newIndex = accessibleTabs.findIndex((tab) => tab.id === tabId);

    if (newIndex > currentIndex) {
      setDirection("left");
    } else {
      setDirection("right");
    }

    setActiveTab(tabId);

    // Refresh the target tab when switching to it
    if (tabId !== "dashboard") {
      setRefreshKeys((prev) => ({
        ...prev,
        [tabId]: prev[tabId] + 1,
      }));
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      console.log("📊 Fetching dashboard stats...");

      // ✅ YEH CORRECT API ENDPOINT HAI
      const res = await api.get("/admin/stats");

      console.log("✅ Stats API Response:", res.data);

      if (res.data.success && res.data.data) {
        setStats(res.data.data);
        setError(null);

        // Debug: Check all received stats
        console.log("📈 Received Stats:", {
          totalUsers: res.data.data.totalUsers,
          totalEmployees: res.data.data.totalEmployees,
          totalAppointments: res.data.data.totalAppointments,
          totalOrders: res.data.data.totalOrders,
          totalProducts: res.data.data.totalProducts,
          totalServices: res.data.data.totalServices,
          totalBranches: res.data.data.totalBranches,
          totalRooms: res.data.data.totalRooms,
          revenue: res.data.data.revenue,
          growthRate: res.data.data.growthRate,
        });
      } else {
        console.error("❌ Invalid response format:", res.data);
        setError("Invalid stats data received from server");
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url,
      });

      if (err.response?.status === 403) {
        setError("FORBIDDEN");
      } else {
        setError(
          err.response?.data?.message || "Failed to load dashboard stats"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Get user's display role for UI
  const getUserDisplayRole = () => {
    if (!user) return "";
    if (user.role === ROLES.EMPLOYEE && user.employeeRole) {
      return `${user.employeeRole} `;
    }
    return user.role;
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab]);

  // Animation classes based on direction
  const getAnimationClass = (tabId) => {
    if (activeTab === tabId) {
      return "opacity-100 scale-100 translate-x-0";
    } else {
      if (direction === "right") {
        return "opacity-0 scale-95 -translate-x-full absolute";
      } else {
        return "opacity-0 scale-95 translate-x-full absolute";
      }
    }
  };

  // Show access denied if no accessible tabs
  if (accessibleTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-amber-50/30 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-rose-200 p-12 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-6">
              <Shield className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 font-[philosopher]">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your current role does not have permission to access the admin
              dashboard. Please contact your administrator for access.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-amber-50/30 pt-2 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl capitalize font-bold text-gray-900 font-[philosopher] mb-2">
                {getUserDisplayRole()} Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <p className="text-gray-700 font-medium">
                    Welcome back,{" "}
                    <span className="text-rose-700">{user?.name}</span>
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                  {getUserDisplayRole()}
                </span>
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium">
                  {accessibleTabs.length} accessible panels
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse"></div>
              <p className="text-sm text-gray-500">Real-time data</p>
            </div>
          </div>

          {/* Tab Navigation - Improved Design */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-rose-200/50 shadow-lg shadow-rose-100/20 p-1 mb-8">
            <div className="flex flex-wrap gap-1">
              {accessibleTabs.map(
                ({ id, label, icon: Icon, color, bgColor }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id)}
                    className={`flex-1 min-w-[140px] flex items-center justify-center px-5 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      activeTab === id
                        ? `${bgColor} ${color} shadow-lg scale-[1.02]`
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    aria-pressed={activeTab === id}
                  >
                    {/* Active indicator */}
                    {activeTab === id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-amber-600"></div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          activeTab === id ? "bg-white/90" : "bg-gray-100"
                        } group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            activeTab === id ? color : "text-gray-500"
                          }`}
                        />
                      </div>
                      <span
                        className={`font-medium ${
                          activeTab === id ? "font-semibold" : ""
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        activeTab === id ? color : "text-gray-400"
                      }`}
                    />
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Content Area with Smooth Transitions */}
        <div className="relative min-h-[60vh] overflow-hidden">
          {/* Dashboard Panel */}
          <div
            className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${getAnimationClass(
              "dashboard"
            )}`}
            aria-hidden={activeTab !== "dashboard"}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/80 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : error === "FORBIDDEN" ? (
              <div className="bg-white rounded-3xl shadow-xl border border-rose-200 p-12 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-6">
                  <Shield className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 font-[philosopher]">
                  Access Restricted
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You do not have permission to access the dashboard.
                  <br />
                  Please contact your administrator.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Go Back
                </button>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Connection Issue
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={fetchStats}
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-lg"
                    >
                      Retry Loading
                    </button>
                  </div>
                </div>
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      name: "Total Users",
                      value: stats.totalUsers || 0,
                      icon: Users,
                      color: "text-blue-600",
                      bgColor: "from-blue-100 to-cyan-100",
                      borderColor: "border-blue-200",
                      show: true,
                      progress: Math.min(
                        ((stats.totalUsers || 0) / 100) * 100,
                        100
                      ), // Progress calculation
                    },
                    {
                      name: "Total Employees",
                      value: stats.totalEmployees || 0,
                      icon: Briefcase,
                      color: "text-green-600",
                      bgColor: "from-green-100 to-emerald-100",
                      borderColor: "border-green-200",
                      show: accessibleTabs.some((tab) => tab.id === "employee"),
                      progress: Math.min(
                        ((stats.totalEmployees || 0) / 20) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Appointments",
                      value: stats.totalAppointments || 0,
                      icon: Calendar,
                      color: "text-purple-600",
                      bgColor: "from-purple-100 to-violet-100",
                      borderColor: "border-purple-200",
                      show: accessibleTabs.some(
                        (tab) => tab.id === "appointments"
                      ),
                      progress: Math.min(
                        ((stats.totalAppointments || 0) / 50) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Orders",
                      value: stats.totalOrders || 0,
                      icon: ShoppingBag,
                      color: "text-emerald-600",
                      bgColor: "from-emerald-100 to-green-100",
                      borderColor: "border-emerald-200",
                      show: accessibleTabs.some((tab) => tab.id === "orders"),
                      progress: Math.min(
                        ((stats.totalOrders || 0) / 50) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Products",
                      value: stats.totalProducts || 0,
                      icon: Package,
                      color: "text-orange-600",
                      bgColor: "from-orange-100 to-amber-100",
                      borderColor: "border-orange-200",
                      show: accessibleTabs.some((tab) => tab.id === "products"),
                      progress: Math.min(
                        ((stats.totalProducts || 0) / 50) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Services",
                      value: stats.totalServices || 0,
                      icon: Scissors,
                      color: "text-pink-600",
                      bgColor: "from-pink-100 to-rose-100",
                      borderColor: "border-pink-200",
                      show: accessibleTabs.some((tab) => tab.id === "services"),
                      progress: Math.min(
                        ((stats.totalServices || 0) / 50) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Branches",
                      value: stats.totalBranches || 0,
                      icon: Building,
                      color: "text-cyan-600",
                      bgColor: "from-cyan-100 to-blue-100",
                      borderColor: "border-cyan-200",
                      show: accessibleTabs.some((tab) => tab.id === "branches"),
                      progress: Math.min(
                        ((stats.totalBranches || 0) / 5) * 100,
                        100
                      ),
                    },
                    {
                      name: "Total Rooms",
                      value: stats.totalRooms || 0,
                      icon: Layers,
                      color: "text-amber-600",
                      bgColor: "from-amber-100 to-orange-100",
                      borderColor: "border-amber-200",
                      show: accessibleTabs.some((tab) => tab.id === "rooms"),
                      progress: Math.min(
                        ((stats.totalRooms || 0) / 20) * 100,
                        100
                      ),
                    },
                    {
                      name: "Revenue",
                      value: `₹${(stats.revenue || 0).toLocaleString("en-IN")}`,
                      icon: DollarSign,
                      color: "text-yellow-600",
                      bgColor: "from-yellow-100 to-amber-100",
                      borderColor: "border-yellow-200",
                      show: true,
                      progress: stats.revenue > 0 ? 50 : 10,
                    },
                    {
                      name: "Growth Rate",
                      value: `${stats.growthRate || 0}%`,
                      icon: TrendingUp,
                      color:
                        stats.growthRate > 0
                          ? "text-green-600"
                          : "text-red-600",
                      bgColor:
                        stats.growthRate > 0
                          ? "from-green-100 to-emerald-100"
                          : "from-red-100 to-pink-100",
                      borderColor:
                        stats.growthRate > 0
                          ? "border-green-200"
                          : "border-red-200",
                      show: true,
                      progress: Math.min(Math.abs(stats.growthRate || 0), 100),
                    },
                    {
                      name: "Today's Appointments",
                      value: stats.todayAppointments || 0,
                      icon: Calendar,
                      color: "text-rose-600",
                      bgColor: "from-rose-100 to-pink-100",
                      borderColor: "border-rose-200",
                      show: true,
                      progress: Math.min(
                        ((stats.todayAppointments || 0) / 20) * 100,
                        100
                      ),
                    },
                    {
                      name: "Conversion Rate",
                      value: `${stats.conversionRate || 0}%`,
                      icon: BarChart3,
                      color:
                        (stats.conversionRate || 0) > 50
                          ? "text-teal-600"
                          : "text-amber-600",
                      bgColor:
                        (stats.conversionRate || 0) > 50
                          ? "from-teal-100 to-emerald-100"
                          : "from-amber-100 to-orange-100",
                      borderColor:
                        (stats.conversionRate || 0) > 50
                          ? "border-teal-200"
                          : "border-amber-200",
                      show: true,
                      progress: Math.min(stats.conversionRate || 0, 100),
                    },
                    {
                      name: "Occupancy Rate",
                      value: `${stats.occupancyRate || 0}%`,
                      icon: Layers,
                      color: "text-indigo-600",
                      bgColor: "from-indigo-100 to-purple-100",
                      borderColor: "border-indigo-200",
                      show: true,
                      progress: Math.min(stats.occupancyRate || 0, 100),
                    },
                  ]
                    .filter((stat) => stat.show)
                    .map(
                      ({
                        name,
                        value,
                        icon: Icon,
                        color,
                        bgColor,
                        borderColor,
                        progress,
                      }) => (
                        <div
                          key={name}
                          className={`bg-gradient-to-br ${bgColor} border ${borderColor} rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
                          onClick={() => {
                            // Navigate to relevant tab if clicked
                            const tabMap = {
                              "Total Employees": "employee",
                              "Total Appointments": "appointments",
                              "Total Orders": "orders",
                              "Total Products": "products",
                              "Total Services": "services",
                              "Total Branches": "branches",
                              "Total Rooms": "rooms",
                            };
                            if (tabMap[name]) {
                              handleTabChange(tabMap[name]);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm ${color}`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                              Live
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {name}
                            </p>
                            <p className={`text-2xl font-bold ${color}`}>
                              {value}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-white/30">
                            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                </div>

                {/* Additional Stats Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Appointment Status Breakdown */}
                  {stats.appointmentStatus &&
                    Object.keys(stats.appointmentStatus).length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-rose-600" />
                            Appointment Status
                          </h3>
                          <span className="text-xs font-medium text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                            {stats.totalAppointments || 0} Total
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(stats.appointmentStatus).map(
                            ([status, count]) => (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      status === "Confirmed"
                                        ? "bg-green-500"
                                        : status === "Completed"
                                        ? "bg-blue-500"
                                        : status === "Pending"
                                        ? "bg-yellow-500"
                                        : status === "Cancelled"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></div>
                                  <span className="text-gray-700 capitalize">
                                    {status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {count}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {Math.round(
                                      (count / (stats.totalAppointments || 1)) *
                                        100
                                    )}
                                    %)
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Employee Roles Breakdown */}
                  {stats.employeeRoles &&
                    Object.keys(stats.employeeRoles).length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Users className="h-5 w-5 mr-2 text-emerald-600" />
                            Employee Roles
                          </h3>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            {stats.totalEmployees || 0} Employees
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(stats.employeeRoles).map(
                            ([role, count]) => (
                              <div
                                key={role}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-emerald-500 to-green-500"></div>
                                  <span className="text-gray-700 capitalize">
                                    {role}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {count}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {Math.round(
                                      (count / (stats.totalEmployees || 1)) *
                                        100
                                    )}
                                    %)
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Room Status Breakdown */}
                  {stats.roomStatus &&
                    Object.keys(stats.roomStatus).length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Layers className="h-5 w-5 mr-2 text-amber-600" />
                            Room Status
                          </h3>
                          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                            {stats.totalRooms || 0} Rooms
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(stats.roomStatus).map(
                            ([status, count]) => (
                              <div
                                key={status}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      status === "Available"
                                        ? "bg-green-500"
                                        : status === "Booked"
                                        ? "bg-blue-500"
                                        : status === "Maintenance"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></div>
                                  <span className="text-gray-700 capitalize">
                                    {status}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {count}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {Math.round(
                                      (count / (stats.totalRooms || 1)) * 100
                                    )}
                                    %)
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Service Categories */}
                  {stats.serviceCategories &&
                    Object.keys(stats.serviceCategories).length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-pink-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Scissors className="h-5 w-5 mr-2 text-pink-600" />
                            Service Categories
                          </h3>
                          <span className="text-xs font-medium text-pink-700 bg-pink-100 px-3 py-1 rounded-full">
                            {stats.totalServices || 0} Services
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(stats.serviceCategories).map(
                            ([category, count]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                                  <span className="text-gray-700">
                                    {category}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {count}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    (
                                    {Math.round(
                                      (count / (stats.totalServices || 1)) * 100
                                    )}
                                    %)
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Appointments */}
                  {stats.recentAppointments &&
                    stats.recentAppointments.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-lg border border-rose-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-rose-600" />
                            Recent Appointments
                          </h3>
                          <button
                            onClick={() => handleTabChange("appointments")}
                            className="text-sm font-medium text-rose-700 hover:text-rose-900 transition-colors"
                          >
                            View All →
                          </button>
                        </div>
                        <div className="space-y-4">
                          {stats.recentAppointments
                            .slice(0, 5)
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between p-3 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`h-2 w-2 rounded-full mr-3 ${
                                      appointment.status === "Confirmed"
                                        ? "bg-green-500"
                                        : appointment.status === "Completed"
                                        ? "bg-blue-500"
                                        : appointment.status === "Pending"
                                        ? "bg-yellow-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {appointment.customer}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {appointment.service}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(
                                      appointment.date
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      appointment.status === "Confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : appointment.status === "Completed"
                                        ? "bg-blue-100 text-blue-800"
                                        : appointment.status === "Pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {appointment.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Quick Stats Summary */}
                  <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl border border-rose-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-rose-600" />
                      Quick Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Users</span>
                        <span className="font-semibold text-gray-900">
                          {stats.totalUsers || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Revenue</span>
                        <span className="font-semibold text-rose-700">
                          ₹{(stats.revenue || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Growth Rate</span>
                        <span
                          className={`font-semibold ${
                            stats.growthRate > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stats.growthRate > 0 ? "↑" : "↓"}{" "}
                          {Math.abs(stats.growthRate || 0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Conversion Rate</span>
                        <span className="font-semibold text-emerald-700">
                          {stats.conversionRate || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">
                          Today's Appointments
                        </span>
                        <span className="font-semibold text-blue-700">
                          {stats.todayAppointments || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Occupancy Rate</span>
                        <span className="font-semibold text-indigo-700">
                          {stats.occupancyRate || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-rose-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Last Updated
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date().toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Other Panels with Smooth Transitions */}
          {accessibleTabs.map((tab) => {
            if (tab.id === "dashboard") return null;

            const Component = {
              employee: AdminEmployeeManagement,
              appointments: AdminAppointmentManagement,
              services: ServiceManagement,
              branches: BranchManagement,
              rooms: RoomManagement,
              products: ProductManagement,
              orders: OrderManagement,
            }[tab.id];

            return Component ? (
              <div
                key={tab.id}
                className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${getAnimationClass(
                  tab.id
                )}`}
                aria-hidden={activeTab !== tab.id}
              >
                <div className="bg-white rounded-3xl shadow-xl border border-rose-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-50 to-amber-50 px-6 py-4 border-b border-rose-200">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl ${tab.bgColor} mr-4`}>
                        <tab.icon className={`h-6 w-6 ${tab.color}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 font-[philosopher]">
                          {tab.label} Management
                        </h2>
                        <p className="text-gray-600">{tab.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Component key={`${tab.id}-${refreshKeys[tab.id]}`} />
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
