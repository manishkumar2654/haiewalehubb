import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    const result = await googleLogin(credentialResponse);

    if (result.success) {
      navigate("/dashboard");
      if (onSuccess) onSuccess();
    } else {
      if (onError) onError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleError = () => {
    if (onError) onError("Google login failed");
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-gray-50">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Signing in with Google...
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          size="large"
          width="100%"
          theme="outline"
          shape="rectangular"
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;
