import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Layout>
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-sky-600">
          Reset Password
        </h2>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              6-Digit Code
            </label>
            <input
              type="text"
              placeholder="Enter OTP code"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-3 flex items-center h-full bg-transparent text-gray-500 hover:text-sky-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center h-full bg-transparent text-gray-500 hover:text-sky-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons side by side */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              className="flex-1 py-3 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
