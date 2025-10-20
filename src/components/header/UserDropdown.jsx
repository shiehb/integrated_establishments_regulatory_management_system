// src/components/header/UserDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Key, LogOut, ChevronDown } from "lucide-react";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../NotificationManager";

export default function UserDropdown({ userLevel = "public", userName = "Guest" }) {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notifications = useNotifications();
  const { logout } = useAuth();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && showUserDropdown) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showUserDropdown]);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className={`flex items-center px-3  space-x-2 text-slate-700 transition-all duration-200 bg-transparent ${
            showUserDropdown ? "" : ""
          }`}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 ring-2 ring-white">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-sm font-medium">{userName}</span>
            <span className="block text-xs text-slate-500 capitalize">
              {userLevel}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              showUserDropdown ? "rotate-180" : ""
            }`} 
          />
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Profile Section */}
            <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 ring-2 ring-white">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-xs text-slate-600 capitalize">{userLevel}</p>
                  <p className="text-xs text-slate-500 truncate">user@example.com</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  navigate("/change-password");
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-left text-slate-700 hover:bg-slate-50 hover:scale-[1.02] transition-all duration-200"
              >
                <Key className="w-4 h-4 mr-3 text-slate-500" />
                Change Password
              </button>
              <div className="my-1 border-t border-slate-200"></div>
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-red-50 hover:text-red-700 hover:scale-[1.02] transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-3 text-red-500" />
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
