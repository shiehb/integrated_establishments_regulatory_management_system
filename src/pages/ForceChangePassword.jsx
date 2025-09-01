import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Layout from "../components/Layout";

export default function ForceChangePassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add password change logic here
    console.log("Password change submitted:", formData);
  };

  return (
    <Layout>
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-8 py-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-sky-600 mb-2">
            Change Password
          </h2>
          <p className="text-gray-600 text-sm">
            Please set a new password to continue
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center h-full bg-transparent text-gray-500 hover:text-sky-600"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center h-full bg-transparent text-gray-500 hover:text-sky-600"
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

        <div className="mt-5 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-medium text-gray-700 mb-1">
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
