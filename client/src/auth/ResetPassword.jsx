import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setMessage("Password reset successful! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 space-y-6 shadow-xl">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">
            Set a New Password
          </h2>
          <p className="text-sm text-gray-600 text-center">
            {successMsg || "Enter your new password below."}
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
