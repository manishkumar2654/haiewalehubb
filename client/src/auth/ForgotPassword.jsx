import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await authService.forgotPassword(email);
      setMessage("A password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 space-y-6 shadow-xl">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">
            Forgot Your Password?
          </h2>
          <p className="text-sm text-gray-600 text-center">
            Enter the email associated with your account and we’ll send you a
            link to reset your password.
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
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
