import { Bell, User, Search, LogOut, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { getUnreadNotificationsCount } from "../services/api";
import { useState, useEffect } from "react";
import Notifications from "./Notifications";

export default function InternalHeader({
  userLevel = "public",
  userName = "John Doe",
  onSearch, // 🔹 callback prop
}) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 state for search input

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadNotificationsCount();
        setUnreadCount(response.count);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await api.post("auth/logout/", { refresh });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);
  const handleChangePassword = () => navigate("/change-password");

  // 🔹 search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value); // pass query to parent
    }
  };

  return (
    <>
      <header className="p-1 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mx-2">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange} // 🔹 bind handler
                className="w-full py-1 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 ">
            <Notifications />

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-2 space-x-2 text-gray-700 transition-colors bg-transparent rounded-lg hover:bg-gray-200">
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

              {/* Dropdown */}
              <div className="absolute right-0 invisible mt-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 z-999 w-43 top-full group-hover:opacity-100 group-hover:visible">
                <div className="py-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </button>
                  <div className="my-1 border-t border-gray-200"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Confirm Logout
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
