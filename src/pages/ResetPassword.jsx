// ResetPassword.jsx
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { resetPasswordWithOtp, sendOtp } from "../services/api";
import OTPInput from "../components/common/OTPInput";
import { useNotifications } from "../components/NotificationManager";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const notifications = useNotifications();

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setCountdown(60);
    } else {
      navigate("/forgot-password");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }

    if (message) {
      setMessage("");
    }
  };

  const handleOTPChange = (otp) => {
    setFormData({
      ...formData,
      otp: otp,
    });

    if (errors.otp) {
      setErrors({
        ...errors,
        otp: "",
      });
    }

    if (message) {
      setMessage("");
    }
  };

  const handleOTPComplete = (otp) => {
    // Optional: Auto-submit when OTP is complete
    // You can uncomment this if you want auto-submission
    // if (formData.newPassword && formData.confirmPassword) {
    //   handleSubmit();
    // }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one special character (@$!%*?&)";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await resetPasswordWithOtp(
        formData.email,
        formData.otp,
        formData.newPassword
      );

      // Show success notification
      notifications.passwordChange(
        response.detail || "Password reset successfully!",
        {
          title: "Password Reset Successful",
          duration: 4000
        }
      );

      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successfully! Please login with your new password.",
            email: formData.email,
          },
        });
      }, 2000);
    } catch (error) {
      let errorMessage = "Failed to reset password. Please try again.";
      
      // Check for different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = "No internet connection. Please check your network and try again.";
      } else if (error.response?.status === 0 || error.message?.includes('fetch')) {
        errorMessage = "Unable to connect to server. Please check your connection and try again.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      // Show error notification
      notifications.error(
        errorMessage,
        {
          title: "Password Reset Failed",
          duration: 8000
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setMessage("");

    try {
      const response = await sendOtp(formData.email);

      // Show success notification
      notifications.success(
        response.detail || "OTP sent successfully!",
        {
          title: "OTP Sent",
          duration: 4000
        }
      );

      setCountdown(60);
    } catch (error) {
      let errorMessage = "Failed to resend OTP. Please try again.";
      
      // Check for different types of errors
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = "No internet connection. Please check your network and try again.";
      } else if (error.response?.status === 0 || error.message?.includes('fetch')) {
        errorMessage = "Unable to connect to server. Please check your connection and try again.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      // Show error notification
      notifications.error(
        errorMessage,
        {
          title: "OTP Send Failed",
          duration: 8000
        }
      );
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Layout>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Reset Password
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input type="hidden" name="email" value={formData.email} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resendLoading}
                className="flex items-center text-xs bg-transparent text-sky-600 hover:text-sky-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                {resendLoading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${formatTime(countdown)}`
                  : "Resend OTP"}
              </button>
            </div>
            
            <OTPInput
              length={6}
              value={formData.otp}
              onChange={handleOTPChange}
              onComplete={handleOTPComplete}
              disabled={loading}
              error={!!errors.otp}
              className="mb-2"
            />
            
            {errors.otp && (
              <p className="mt-2 text-xs text-red-500 text-center">{errors.otp}</p>
            )}
            
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to {formData.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className={`w-full border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("resetEmail");
                navigate("/");
              }}
              className="flex-1 py-3 font-medium text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 font-medium text-white transition rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="p-3 mt-5 rounded-lg bg-gray-50">
          <h3 className="mb-1 text-xs font-medium text-gray-700">
            Password Requirements:
          </h3>
          <ul className="text-xs text-gray-600">
            <li>• Minimum 8 characters</li>
            <li>• At least one uppercase letter (A-Z)</li>
            <li>• At least one lowercase letter (a-z)</li>
            <li>• At least one number (0-9)</li>
            <li>• At least one special character (@$!%*?&)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
