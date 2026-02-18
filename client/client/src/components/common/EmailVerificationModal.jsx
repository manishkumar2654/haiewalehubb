import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const EmailVerificationModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { sendVerificationEmail } = useAuth();

  const handleSendEmail = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    const result = await sendVerificationEmail();

    if (result.success) {
      setMessage(
        "Verification email sent successfully! Please check your inbox."
      );
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Verify Your Email
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Your email is not verified yet. Please verify your email to access
            all features.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={handleSendEmail}
            loading={loading}
            className="flex-1"
          >
            Send Verification Email
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
