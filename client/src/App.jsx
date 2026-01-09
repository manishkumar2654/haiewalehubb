import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ IMPORT SCROLL TO TOP
import ScrollToTop from "./components/ScrollToTop";

// Existing components
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Layout from "./components/Bill/Layout";
import ViewBillsPage from "./pages/ViewBillsPage";
import CreateBillPage from "./pages/CreateBillPage";
import EditBillPage from "./pages/EditBillPage";
import MainLayout from "./components/MainLayout";

// New Auth Components
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./components/common/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

// New Dashboard Components
import UserDashboard from "./pages/dashboard/UserDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminEmployeeManagement from "./pages/dashboard/AdminEmployeeManagement";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import AppointmentBooking from "./pages/appointment/AppointmentBooking";
import { ROLES, EMPLOYEE_ROLES, GOOGLE_CLIENT_ID } from "./utils/constants";
import MyAppointments from "./pages/appointment/MyAppointments";
import Store from "./pages/Store";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import CreateOrderPage from "./pages/CreateOrderPage";
import OrderDetails from "./pages/OrderDetails";
import OrdersPage from "./pages/OrdersPage";
import AddressManagement from "./pages/AddressManagement";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";

import AppointmentSearch from "./components/appointment/AppointmentSearch";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/Contact";
import TermsAndConditions from "./pages/TermsAndConditions";
import WalkinBooking from "./pages/walkin/WalkinBooking";

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return null;

  // ✅ ADMIN FIRST
  if (user.role === ROLES.ADMIN) {
    return <AdminDashboard />;
  }

  // ✅ MANAGER & RECEPTIONIST → AdminDashboard
  if (
    user.role === ROLES.EMPLOYEE &&
    [EMPLOYEE_ROLES.MANAGER, EMPLOYEE_ROLES.RECEPTIONIST].includes(
      user.employeeRole
    )
  ) {
    return <AdminDashboard />;
  }

  // ✅ OTHER EMPLOYEES
  if (user.role === ROLES.EMPLOYEE) {
    return <EmployeeDashboard />;
  }

  // ✅ NORMAL USER
  return <UserDashboard />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/unauthorized" replace />;

  const role = user.role?.toLowerCase();
  const employeeRole = user.employeeRole?.toLowerCase();

  const allowedEmployeeRoles = ["manager", "receptionist"];

  const hasAccess =
    role === "admin" ||
    (role === "employee" && allowedEmployeeRoles.includes(employeeRole));

  return hasAccess ? children : <Navigate to="/unauthorized" replace />;
};

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          {/* ✅ ADD SCROLL TO TOP HERE - BEFORE ROUTES */}
          <ScrollToTop />

          <div className="bg-black text-white min-h-screen">
            <Routes>
              {/* Auth Routes - No navbar/layout */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/auth/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthLayout>
                      <DashboardRouter />
                    </AuthLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/dashboard/employees"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AuthLayout>
                        <AdminEmployeeManagement />
                      </AuthLayout>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />

              {/* Main layout wraps homepage, about, and bills */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="store" element={<Store />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="terms" element={<TermsAndConditions />} />
                <Route
                  path="cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-appointments"
                  element={
                    <ProtectedRoute>
                      <MyAppointments />
                    </ProtectedRoute>
                  }
                />
                <Route path="createorder" element={<CreateOrderPage />} />
                <Route path="order/:id" element={<OrderDetails />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="service/:id" element={<ServiceDetailsPage />} />
                <Route
                  path="address-management"
                  element={<AddressManagement />}
                />

                <Route
                  path="/search-appointment"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <AppointmentSearch />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/walkin-booking"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <WalkinBooking />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />

                <Route path="/appointment" element={<AppointmentBooking />} />
              </Route>

              <Route path="bills" element={<Layout />}>
                <Route path="view" element={<ViewBillsPage />} />
                <Route path="create" element={<CreateBillPage />} />
                <Route path="edit/:id" element={<EditBillPage />} />
              </Route>

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
