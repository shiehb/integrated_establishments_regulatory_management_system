import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../hooks/useAuth";
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
  const { login } = useAuth();

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
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, location.pathname]);

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
    setErrors({});
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.mustChangePassword) {
        navigate("/force-change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorData = err.response?.data;
      const errorCode = errorData?.error_code;
      
      if (errorCode === 'ACCOUNT_LOCKED') {
        const remainingMinutes = errorData.details?.remaining_minutes || 0;
        const message = `Account locked. Try again in ${remainingMinutes} minutes.`;
        setErrors({ general: message });
        notifications.error(message, { title: "Account Locked", duration: 8000 });
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        setFormData(prev => ({ ...prev, password: "" }));
        setErrors({ password: "Invalid email or password." });
        notifications.error("Invalid email or password.", { title: "Login Failed" });
      } else if (errorCode === 'ACCOUNT_DEACTIVATED') {
        setErrors({ general: "Account deactivated. Contact administrator." });
        notifications.error("Account deactivated. Contact administrator.", { title: "Account Deactivated" });
      } else if (!navigator.onLine) {
        setErrors({ general: "No internet connection." });
        notifications.error("No internet connection.", { title: "Connection Error" });
      } else {
        setErrors({ general: "Login failed. Please try again." });
        notifications.error("Login failed. Please try again.", { title: "Login Error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Integrated Establishment Regulatory Management System
        </h2>

        {errors.general && (
          <div className="p-3 mb-4 text-sm text-center text-red-600 bg-red-100 rounded-lg">
            {errors.general}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            className="w-full py-3 font-medium text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
