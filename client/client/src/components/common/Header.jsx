import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Search,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLES, EMPLOYEE_ROLES } from "../../utils/constants";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSearchAppointment, setShowSearchAppointment] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const { user, logout, resendVerificationEmail, isLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Check if user has permission for Search Appointment
  const hasSearchAppointmentAccess = () => {
    if (!user) return false;

    // Admin always has access
    if (user.role === ROLES.ADMIN) return true;

    // All employees have access
    if (user.role === ROLES.EMPLOYEE) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    setShowSearchAppointment(hasSearchAppointmentAccess());

    // Show email verification modal if user is logged in but email not verified
    if (user && !user.isEmailVerified && user.role !== "admin") {
      // Show modal after 2 seconds delay
      const timer = setTimeout(() => {
        setShowEmailVerificationModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowEmailVerificationModal(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const getUserDisplayRole = () => {
    if (!user) return "";

    if (user.role === ROLES.EMPLOYEE && user.employeeRole) {
      return `${user.role} (${user.employeeRole})`;
    }

    return user.role;
  };

  const handleResendVerificationEmail = async () => {
    try {
      await resendVerificationEmail();
      // You can show a success toast here
      console.log("Verification email resent successfully!");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }
  };

  return (
    <>
      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-rose-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-[philosopher]">
                      Verify Your Email
                    </h3>
                    <p className="text-sm text-gray-600">
                      Important: Verify to access all features
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailVerificationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Verification Required
                    </h4>
                    <p className="text-sm text-gray-700">
                      We've sent a verification email to{" "}
                      <span className="font-semibold text-rose-700">
                        {user?.email}
                      </span>
                      . Please check your inbox and verify your email to unlock
                      all features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Access to all services</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Book appointments</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Shop from store</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-rose-100 bg-gray-50 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResendVerificationEmail}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowEmailVerificationModal(false)}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  I'll Do It Later
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Didn't receive the email? Check your spam folder or try
                resending.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-rose-50/95 via-white to-amber-50/95 backdrop-blur-lg border-b border-rose-200/30 shadow-lg shadow-rose-100/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <img
                  src="/hairhublogo.png"
                  alt="S.Tatsaya Logo"
                  className="h-10 w-auto drop-shadow-md hover:scale-105 transition-transform duration-300"
                />
                <span className="hidden lg:block text-2xl font-[philosopher] font-bold bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 animate-gradient-flow bg-clip-text text-transparent">
                  HAIR HUB
                </span>
              </Link>

              {/* Email Verification Badge (if not verified) */}
              {user && !user.isEmailVerified && user.role !== "admin" && (
                <div className="ml-3">
                  <button
                    onClick={() => setShowEmailVerificationModal(true)}
                    className="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors border border-amber-200"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Verify Email
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-rose-200 text-rose-900 hover:bg-white hover:text-rose-700 transition-all duration-300 shadow-sm"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
              >
                Home
              </Link>

              {/* <Link
                to="/appointment"
                className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
              >
                Appointment
              </Link> */}

              {/* <Link
                to="/store"
                className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
              >
                Store
              </Link> */}

              {/* Search Appointment - Only for authorized users */}
              {showSearchAppointment && (
                <Link
                  to="/search-appointment"
                  className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
                >
                  Bill/Walkin
                </Link>
              )}

              {/* <Link
                to="/about"
                className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
              >
                About Us
              </Link>

              <Link
                to="/contact"
                className="px-4 py-2 text-sm font-[poppins] font-medium text-rose-900 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all duration-300"
              >
                Contact
              </Link> */}
            </nav>

            {/* Right Section - Icons & User */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Heart Icon - Only for logged in users */}
              {user && (
                <button className="p-2 rounded-full bg-rose-100 text-rose-900 hover:bg-rose-200 hover:text-rose-700 transition-all duration-300 shadow-sm">
                  <Heart className="h-5 w-5" />
                </button>
              )}

              {/* Cart Icon - Only for logged in users */}
              {user && (
                <Link
                  to="/cart"
                  className="p-2 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-700 transition-all duration-300 shadow-sm relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {/* Cart badge */}
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Link>
              )}

              {/* User Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-rose-100 to-amber-100 rounded-lg border border-rose-200 hover:border-rose-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-rose-900">
                        {user.name.split(" ")[0]}
                      </p>
                      <p className="text-xs text-rose-700">
                        {getUserDisplayRole()}
                      </p>
                      {/* Email Verification Status */}
                      {!user.isEmailVerified && user.role !== "admin" && (
                        <span className="text-xs text-amber-600 font-medium flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />

                      {/* Dropdown */}
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-rose-200 overflow-hidden z-50 animate-fadeIn">
                        {/* User Info */}
                        <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-100">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 flex items-center justify-center">
                              <span className="text-white font-bold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-xs text-rose-700">
                                {user.email}
                              </p>
                              <p className="text-xs font-medium text-amber-700 capitalize">
                                {getUserDisplayRole()}
                              </p>
                              {/* Email Verification Status in Dropdown */}
                              {!user.isEmailVerified &&
                                user.role !== "admin" && (
                                  <button
                                    onClick={() => {
                                      setShowEmailVerificationModal(true);
                                      setUserDropdownOpen(false);
                                    }}
                                    className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors flex items-center"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Verify Email
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {showSearchAppointment && (
                            <button
                              onClick={() => {
                                navigate("/search-appointment");
                                setUserDropdownOpen(false);
                              }}
                              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 transition-colors duration-200"
                            >
                              <Search className="h-4 w-4 mr-3 text-rose-600" />
                              Bill/Walkin
                            </button>
                          )}

                          <button
                            onClick={() => {
                              navigate("/dashboard");
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-rose-50 transition-colors duration-200"
                          >
                            <User className="h-4 w-4 mr-3 text-rose-600" />
                            Dashboard
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm text-rose-700 hover:bg-rose-50 transition-colors duration-200 border-t border-gray-100"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Login/Signup buttons for non-logged in users
                <div className="flex items-center space-x-3">
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-rose-900 hover:text-rose-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="lg:hidden mt-2 pb-4 border-t border-rose-100">
              <div className="pt-4 space-y-1">
                {/* Email Verification Alert in Mobile Menu */}
                {user && !user.isEmailVerified && user.role !== "admin" && (
                  <div className="mx-4 mb-3">
                    <button
                      onClick={() => {
                        setShowEmailVerificationModal(true);
                        setMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-3 flex items-center space-x-3 hover:shadow-md transition-shadow"
                    >
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">
                          Verify Your Email
                        </p>
                        <p className="text-xs text-gray-600">
                          Click to verify {user.email}
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Home
                </Link>
{/* 
                <Link
                  to="/appointment"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Appointment
                </Link> */}

                {/* <Link
                  to="/store"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Store
                </Link> */}

                {showSearchAppointment && (
                  <Link
                    to="/search-appointment"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Bill/Walkin
                  </Link>
                )}

                {/* <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Contact
                </Link> */}

                {/* Mobile Cart & Heart for logged in users */}
                {user && (
                  <>
                    <div className="border-t border-rose-100 pt-3 mt-3">
                      <div className="flex space-x-4 px-4">
                        <Link
                          to="/cart"
                          onClick={() => setMenuOpen(false)}
                          className="flex-1 p-3 bg-amber-50 text-amber-900 rounded-lg flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>Cart</span>
                        </Link>
                        <button className="flex-1 p-3 bg-rose-50 text-rose-900 rounded-lg flex items-center justify-center space-x-2">
                          <Heart className="h-5 w-5" />
                          <span>Wishlist</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-rose-100 pt-3 px-4">
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-rose-700">
                            {getUserDisplayRole()}
                          </p>
                          {/* Email Verification Status */}
                          {!user.isEmailVerified && user.role !== "admin" && (
                            <span className="text-xs text-amber-600 font-medium flex items-center">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Verify Email
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setMenuOpen(false);
                        }}
                        className="w-full mt-2 p-3 text-left text-gray-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Dashboard
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full mt-2 p-3 text-left text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}

                {/* Mobile Login/Signup for non-logged in users */}
                {!user && (
                  <div className="border-t border-rose-100 pt-4 px-4 space-y-3">
                    <Link
                      to="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full p-3 text-center text-rose-900 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full p-3 text-center bg-gradient-to-r from-rose-700 to-amber-700 text-white rounded-lg hover:from-rose-800 hover:to-amber-800 transition-all duration-300"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
