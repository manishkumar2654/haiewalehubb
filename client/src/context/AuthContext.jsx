// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to normalize user object
  const normalizeUser = (userData) => {
    if (!userData) return null;

    // Create a normalized user object with both id and _id
    const normalized = { ...userData };

    // Ensure both id and _id are available and consistent
    if (userData._id && !userData.id) {
      normalized.id = userData._id;
    } else if (userData.id && !userData._id) {
      normalized._id = userData.id;
    } else if (!userData._id && !userData.id) {
      console.warn("User data missing both id and _id fields:", userData);
    }

    return normalized;
  };

  // On mount, load token & user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        const normalized = normalizeUser(parsed);
        console.log(
          "🔄 AuthContext - Loading user from localStorage:",
          normalized
        );
        setUser(normalized);
      } catch (error) {
        console.error("❌ Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data;

      console.log("🔑 Login response user:", user);

      const normalizedUser = normalizeUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      console.log("✅ Login successful - Normalized user:", normalizedUser);

      return { success: true };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const response = await authService.googleLogin(
        credentialResponse.credential
      );
      const { token, user } = response.data;

      console.log("🔑 Google login response user:", user);

      const normalizedUser = normalizeUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      console.log(
        "✅ Google login successful - Normalized user:",
        normalizedUser
      );

      return { success: true };
    } catch (error) {
      console.error("❌ Google login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Google login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token, user } = response.data;

      console.log("🔑 Register response user:", user);

      const normalizedUser = normalizeUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      console.log(
        "✅ Registration successful - Normalized user:",
        normalizedUser
      );

      return { success: true };
    } catch (error) {
      console.error("❌ Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    console.log("🚪 Logging out user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const sendVerificationEmail = async () => {
    try {
      await authService.sendVerificationEmail();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to send verification email",
      };
    }
  };

  // Add a method to refresh user data
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await authService.getCurrentUser();
      const normalizedUser = normalizeUser(response.data.user);

      localStorage.setItem("user", JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      console.log("🔄 User data refreshed:", normalizedUser);
    } catch (error) {
      console.error("❌ Error refreshing user data:", error);
    }
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    sendVerificationEmail,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
