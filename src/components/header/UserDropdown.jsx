// src/components/header/UserDropdown.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Key, LogOut } from "lucide-react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import api from "../../services/api";
import { useNotifications } from "../NotificationManager";

export default function UserDropdown({ userLevel = "public", userName = "Guest" }) {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notifications = useNotifications();

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) await api.post("auth/logout/", { refresh });
      notifications.success(
        "Logged out successfully!",
        {
          title: "Logout Successful",
          duration: 3000
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
      notifications.error(
        "Logout failed!",
        {
          title: "Logout Error",
          duration: 6000
        }
      );
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center px-2 space-x-2 text-gray-700 transition-colors bg-transparent rounded-lg hover:bg-gray-200"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-medium">{userName}</span>
            <span className="block text-xs text-gray-500 capitalize">
              {userLevel}
            </span>
          </div>
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-2">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate("/change-password");
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </button>
              <div className="my-1 border-t border-gray-200"></div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        open={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        loading={false}
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
