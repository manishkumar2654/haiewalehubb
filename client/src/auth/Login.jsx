import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleError = (error) => {
    setError(error);
  };

  return (
    <div className="min-h-screen bg-pink-100 relative flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          {/* <div className="mb-6">
            <GoogleLoginButton onError={handleGoogleError} />
          </div> */}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              {/* <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span> */}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <Link
                to="/auth/forgot-password"
                className="text-gray-600 hover:text-primary-500 text-sm"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
