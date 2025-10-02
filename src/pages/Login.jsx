import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/api";
import { useNotifications } from "../components/NotificationManager";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const passwordInputRef = useRef(null);
  const notifications = useNotifications();

  // Show message from state (e.g., after password change)
  useEffect(() => {
    if (location.state?.message) {
      notifications.success(
        location.state.message,
        {
          title: "Success",
          duration: 5000
        }
      );
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, notifications]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    try {
      const loginRes = await loginUser(formData.email, formData.password);
      
      // Show success notification
      notifications.login(
        "Login successful! Welcome back.",
        {
          title: "Login Successful",
          duration: 3000
        }
      );
      
      if (loginRes.must_change_password) {
        navigate("/force-change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Check for different types of errors
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error') || !navigator.onLine) {
        // Network error - show general error message
        setErrors({ general: "No internet connection. Please check your network and try again." });
        notifications.error(
          "No internet connection. Please check your network and try again.",
          {
            title: "Connection Error",
            duration: 8000
          }
        );
      } else if (err.response?.status === 401) {
        // Invalid credentials - clear password only and show specific error
        setFormData(prev => ({ ...prev, password: "" }));
        setErrors({ password: "Invalid password. Please try again." });
        // Focus the password field after clearing it
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 100);
        notifications.error(
          "Invalid password. Please try again.",
          {
            title: "Login Failed",
            duration: 6000
          }
        );
      } else if (err.response?.status === 0 || err.message?.includes('fetch')) {
        // Server connection error - show general error message
        setErrors({ general: "Unable to connect to server. Please check your connection and try again." });
        notifications.error(
          "Unable to connect to server. Please check your connection and try again.",
          {
            title: "Server Error",
            duration: 8000
          }
        );
      } else if (err.response?.data?.detail) {
        // Other server errors - show specific error message
        setErrors({ general: err.response.data.detail });
        notifications.error(
          err.response.data.detail,
          {
            title: "Login Error",
            duration: 8000
          }
        );
      } else {
        // Generic error
        setErrors({ general: "An error occurred. Please try again." });
        notifications.error(
          "An error occurred. Please try again.",
          {
            title: "Login Error",
            duration: 8000
          }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Account Login
        </h2>

        {errors.general && (
          <div className="p-3 mb-4 text-sm text-center text-red-600 bg-red-100 rounded-lg">
            {errors.general}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <Link
            to="/forgot-password"
            className="block text-sm text-right text-sky-600 hover:underline"
          >
            Forgot Password?
          </Link>

          <button
            type="submit"
            className="w-full py-3 text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
