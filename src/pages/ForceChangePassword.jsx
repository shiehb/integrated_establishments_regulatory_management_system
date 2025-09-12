import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Layout from "../components/Layout";
import { changePassword } from "../services/api"; // implement this in api.js

export default function ForceChangePassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ...validation...
    try {
      await changePassword(formData.newPassword);
      navigate("/"); // Go to dashboard after password change
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to change password.");
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md px-8 py-4 bg-white shadow-lg rounded-2xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-sky-600">
            Change Password
          </h2>
          <p className="text-sm text-gray-600">
            Please set a new password to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-center text-red-600">{error}</div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition mt-4"
          >
            Change Password
          </button>
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
            <li>• At least one special character (!@#$%^&* etc.)</li>
            <li>• Should not match your previous password</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
